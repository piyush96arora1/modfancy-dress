# Collection Import Guide

This guide will help you import all categories and products from your collection folder into your Supabase database.

## ✅ Quick Start

### Step 1: Verify Setup
Before importing, verify everything is set up correctly:

```bash
npm run verify:setup
```

This will check:
- ✅ Collection folder exists
- ✅ Environment variables are configured
- ✅ Collection structure is valid

### Step 2: Run Import
Once verified, run the import:

```bash
npm run import:collection
```

The script will:
1. Scan all categories and products
2. Create categories in database
3. Upload images to Supabase Storage
4. Create products with ₹400 default price
5. Link images to products

## 📊 What Gets Imported

- **Categories**: All folder names become categories (e.g., `accessories`, `animal-costume`)
- **Products**: Each product folder becomes a product
- **Images**: 
  - `-display.webp` files become primary images
  - Numbered images (`-1.jpg`, `-2.jpg`, etc.) become additional images
- **Price**: All products default to ₹400 (you can edit later in admin panel)

## 🔍 Import Details

### Category Creation
- **Name**: Converted from slug (e.g., `animal-costume` → `Animal Costume`)
- **Slug**: Original folder name
- **Description**: Empty (you can add later)

### Product Creation
- **Name**: Converted from folder name (e.g., `cat-fancy-dress-costume-for-children` → `Cat Fancy Dress Costume For Children`)
- **Slug**: Original folder name
- **Price**: ₹400 (default)
- **Category**: Linked to parent category
- **Status**: Active
- **Quantity/Size**: Empty (you can add variants later)

### Image Handling
- Images are uploaded to Supabase Storage bucket: `product-images`
- Storage path: `products/{filename}`
- Primary image: `-display.webp` (if exists) or first numbered image
- Additional images: Ordered sequentially (1, 2, 3...)

## ⚠️ Important Notes

1. **No Duplicates**: The script skips products that already exist (checks by slug)
2. **Safe to Re-run**: You can run the import multiple times safely
3. **Error Handling**: If a product fails, the script continues with others
4. **Rate Limiting**: Small delays prevent overwhelming Supabase

## 📈 Expected Results

Based on verification:
- **Categories**: ~50 categories
- **Products**: 100+ products (estimated)
- **Images**: Multiple images per product

## 🛠️ Troubleshooting

### "Collection path does not exist"
- Check that the collection folder is at: `/home/fa064236/Downloads/ModFancyDress-main/public/collection`
- Update the path in `scripts/import-collection.ts` if needed

### "Missing Supabase environment variables"
- Ensure `.env.local` contains:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-url
  SUPABASE_SERVICE_ROLE_KEY=your-key
  ```

### "Storage upload errors"
- Verify `product-images` bucket exists in Supabase Storage
- Ensure bucket is set to **Public**
- Check storage policies allow uploads

### "Database errors"
- Verify Supabase connection
- Check RLS policies allow inserts
- Ensure tables exist (run migrations if needed)

## 📝 After Import

1. **Review Products**: Check admin panel at `/admin/products`
2. **Edit Prices**: Update prices individually or in bulk
3. **Add Descriptions**: Add product descriptions
4. **Manage Variants**: Add size/color variants if needed
5. **Verify Images**: Check that all images uploaded correctly

## 🔄 Re-running Import

If you need to re-import:
- The script will skip existing products (by slug)
- New products will be added
- Existing products won't be modified
- To update existing products, delete them first or edit manually

## 💡 Tips

- **Test First**: Consider testing with a small category first
- **Backup**: Backup your database before large imports
- **Monitor**: Watch the console output for any errors
- **Edit Later**: You can edit prices and details in the admin panel after import

