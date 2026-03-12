/**
 * compress-images.js
 * 
 * Downloads all images from Supabase, compresses them to WebP,
 * and uploads to new folders: products-webp/ and banners-webp/
 * 
 * Originals are NOT touched.
 * 
 * Usage:
 *   1. npm install @supabase/supabase-js sharp
 *   2. Set your SUPABASE_SERVICE_KEY below
 *   3. node compress-images.js
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://udnidqllpmyoothwznbv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbmlkcWxscG15b290aHd6bmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE1NjUxMSwiZXhwIjoyMDgzNzMyNTExfQ.KVkhBfMeyMv7FRzlVCeKkSySLmfVtm7xnJkJqVRE07E'; // Settings → API → service_role
const BUCKET = 'product-images';
const WEBP_QUALITY = 85; // 85 = visually lossless, good compression
const SKIP_BELOW_KB = 100; // Skip files already under 100KB (already small enough)
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const FOLDER_MAP = {
    'products': 'products-webp',
    'banners': 'banners-webp',
    'categories': 'categories-webp',
};

async function listAllFiles(folder) {
    const files = [];
    let offset = 0;
    const limit = 100;
    while (true) {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(folder, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

        if (error || !data || data.length === 0) break;
        for (const f of data) {
            if (f.name && f.id) files.push(`${folder}/${f.name}`);
        }
        if (data.length < limit) break;
        offset += limit;
    }
    return files;
}

async function main() {
    // Step 1: Get all already-done destination files
    console.log('🔍 Loading already-processed destination files...');
    const alreadyDone = new Set();
    for (const destFolder of Object.values(FOLDER_MAP)) {
        const files = await listAllFiles(destFolder);
        files.forEach(f => alreadyDone.add(f));
    }
    console.log(`   ${alreadyDone.size} files already in destination folders\n`);

    // Step 2: Find all .webp files in source folders
    console.log('🔍 Finding existing .webp files in source folders...');
    const toCopy = [];
    for (const srcFolder of Object.keys(FOLDER_MAP)) {
        const files = await listAllFiles(srcFolder);
        for (const path of files) {
            if (!path.endsWith('.webp')) continue; // only webp files
            const destFolder = FOLDER_MAP[srcFolder];
            const filename = path.slice(srcFolder.length + 1);
            const destPath = `${destFolder}/${filename}`;
            if (!alreadyDone.has(destPath)) {
                toCopy.push({ srcPath: path, destPath });
            }
        }
    }

    console.log(`   ${toCopy.length} files need copying\n`);

    if (toCopy.length === 0) {
        console.log('✅ Nothing to do — all webp files already copied!');
        return;
    }

    // Step 3: Copy each file
    let success = 0, skipped = 0, errors = 0;
    const errorList = [];

    for (let i = 0; i < toCopy.length; i++) {
        const { srcPath, destPath } = toCopy[i];
        process.stdout.write(`[${i + 1}/${toCopy.length}] ${srcPath} ... `);

        // Download
        const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(srcPath);
        if (dlErr) {
            console.log(`✗ download: ${dlErr.message}`);
            errors++;
            errorList.push({ srcPath, error: dlErr.message });
            continue;
        }

        // Upload to new path
        const buffer = Buffer.from(await blob.arrayBuffer());
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(
            destPath,
            buffer,
            { contentType: 'image/webp', cacheControl: '31536000', upsert: false }
        );

        if (upErr) {
            if (upErr.message?.includes('already exists')) {
                console.log(`⏭  already exists`);
                skipped++;
            } else {
                console.log(`✗ upload: ${upErr.message}`);
                errors++;
                errorList.push({ srcPath, error: upErr.message });
            }
            continue;
        }

        console.log(`✓ copied`);
        success++;

        await new Promise(r => setTimeout(r, 50));
    }

    console.log('\n─────────────────────────────────────────────');
    console.log('✅ Done!');
    console.log(`   Copied   : ${success} files`);
    console.log(`   Skipped  : ${skipped} files`);
    console.log(`   Errors   : ${errors} files`);

    if (errorList.length > 0) {
        console.log('\n❌ Failed:');
        errorList.forEach(e => console.log(`   ${e.srcPath} — ${e.error}`));
        console.log('\nRe-run to retry failed files.');
    }

    console.log('\nAll done! getImageUrl() should now work for all image types.');
}

main().catch(console.error);

