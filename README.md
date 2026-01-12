# Mod Fancy Dress - E-commerce Application

A fullstack Next.js e-commerce application for Mod Fancy Dress built with Next.js 14+ and Supabase.

## Features

### Public Features
- Browse products with search and category filtering
- Product detail pages with variant selection (size, color)
- Shopping cart (localStorage-based)
- Order submission (no payment required)
- SEO-friendly pages

### Admin Features
- Product management (CRUD operations)
- Category management
- Image upload to Supabase Storage
- Product variants (SKU, size, color, quantity, price override)
- Order management and status updates
- Role-based access control

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** Zustand (for cart)
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Custom components with Tailwind CSS

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### 2. Clone and Install

```bash
cd modfacnydress
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor

3. Create Storage Bucket:
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `product-images`
   - Set it to **Public** (for public read access)
   - Add policy: Allow authenticated users to upload

4. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Create Admin User

1. Sign up at `/signup` with role "admin"
2. Or manually update user metadata in Supabase:
   - Go to Authentication > Users
   - Edit user and set `raw_user_meta_data` → `role` to `"admin"`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
modfacnydress/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx      # Homepage
│   │   ├── products/     # Product listing & detail
│   │   ├── cart/         # Shopping cart
│   │   └── category/     # Category pages
│   ├── (auth)/           # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (admin)/          # Admin pages
│   │   └── admin/
│   │       ├── products/
│   │       ├── categories/
│   │       └── orders/
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   ├── public/           # Public-facing components
│   └── admin/            # Admin components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── store/            # Zustand stores
│   ├── hooks/            # React hooks
│   └── utils/            # Utility functions
├── types/                # TypeScript types
└── supabase/
    └── migrations/       # Database migrations
```

## Database Schema

- **categories** - Product categories
- **products** - Product information
- **product_images** - Product images (multiple per product)
- **product_variants** - Product variants (size, color, SKU, etc.)
- **orders** - Customer orders
- **order_items** - Order line items

## Key Features Explained

### Product Variants
- Products can have multiple variants
- Each variant can have: SKU, size, color, quantity, price override
- Size can be in various formats: "1-2 yrs", "12,14,16", "12,14,16,18,20,22,24,26,28,30,32,34"
- Only product name and image are mandatory

### Cart System
- Cart stored in localStorage (session-based)
- On order submission, cart is cleared
- Orders are saved to database for admin review

### Admin Access
- Admin routes protected by middleware
- Only users with `role: 'admin'` can access admin panel
- Admin can manage products, categories, and orders

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Storage
- Ensure Storage bucket is public for product images
- Update CORS settings if needed

## Notes

- Product images are uploaded to Supabase Storage
- Cart persists in localStorage (cleared on order submission)
- Orders don't require payment - just customer information
- Admin can update order status (pending → confirmed → shipped)

## License

Private project for Mod Fancy Dress
# modfancy-dress
