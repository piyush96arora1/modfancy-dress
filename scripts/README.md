# Import Collection Script

This script imports all categories and products from the collection folder into your Supabase database.

## Prerequisites

1. **Environment Variables**: Make sure your `.env.local` file contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Collection Folder**: The script expects the collection folder at:
   ```
   /home/fa064236/Downloads/ModFancyDress-main/public/collection
   ```

3. **Supabase Storage**: Ensure you have a `product-images` bucket created in Supabase Storage (should be public).

## Usage

Run the import script:

```bash
npm run import:collection
```

## What It Does

1. **Scans** the collection folder for categories and products
2. **Creates categories** in the database (skips if already exists)
3. **Creates products** with:
   - Name: Converted from folder slug (e.g., `anarkali-cap-topi` → `Anarkali Cap Topi`)
   - Slug: Original folder name
   - Price: ₹400 (default, you can edit later)
   - Category: Linked to the category
   - Active: `true`
4. **Uploads images** to Supabase Storage (`product-images` bucket)
5. **Links images** to products in the `product_images` table
   - `-display.webp` images are marked as primary
   - Numbered images (1.jpg, 2.jpg, etc.) are ordered sequentially

## Features

- ✅ **Smart skipping**: Won't duplicate products that already exist (checks by slug)
- ✅ **Error handling**: Continues processing even if individual products fail
- ✅ **Progress tracking**: Shows progress for categories and products
- ✅ **Image handling**: Handles both `.jpg` and `.webp` formats
- ✅ **Rate limiting**: Small delays to avoid overwhelming Supabase

## Output

The script will show:
- Number of categories found
- Progress for each category
- Number of products imported per category
- Final summary with totals

## Troubleshooting

- **"Collection path does not exist"**: Check that the collection folder is at the expected path
- **"Missing Supabase environment variables"**: Ensure `.env.local` has the required variables
- **Storage upload errors**: Check that the `product-images` bucket exists and is public
- **Database errors**: Verify your Supabase connection and RLS policies

