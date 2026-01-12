# User Guide - How Normal Users See the Website

## Overview

Normal users (non-admin) can browse and shop **without needing to log in**. The website is fully accessible to everyone, and login is optional.

## What Normal Users Can Do

### 1. **Browse Without Login** ✅
- Visit the homepage
- View all products
- Browse by categories
- Search for products
- View product details
- Add items to cart
- Place orders

**No account required for shopping!**

### 2. **Homepage** (`/`)
When users visit the website, they see:
- **Hero Section**: Welcome message with "Shop Now" button
- **Categories Grid**: Clickable category cards to browse by category
- **Featured Products**: Grid of latest products (up to 8 products)

### 3. **Product Listing** (`/products`)
Users can:
- See all active products in a grid layout
- **Search** products by name (search bar in header)
- **Filter by category** (sidebar filter)
- **Sort** products:
  - Newest First (default)
  - Price: Low to High
  - Price: High to Low
- Click any product to see details

### 4. **Category Pages** (`/category/[category-slug]`)
- View all products in a specific category
- See category name and description
- Same product grid layout as main products page

### 5. **Product Detail Page** (`/products/[product-slug]`)
Users can:
- See product images (primary + gallery)
- Read product description
- View product price
- **Select variants** (if available):
  - Size (e.g., "1-2 yrs", "12,14,16", etc.)
  - Color
- Choose quantity
- **Add to Cart** button

### 6. **Shopping Cart** (`/cart`)
Users can:
- View all items in cart
- See product images, names, sizes, colors
- Update quantities
- Remove items
- See cart total
- **Place Order** (requires customer info):
  - Name *
  - Email *
  - Phone *
  - Shipping Address *
    - Street
    - City
    - State
    - ZIP Code
    - Country

### 7. **Navigation**
In the header, normal users see:
- **Logo** (links to homepage)
- **Products** link
- **Shopping Cart icon** (with item count badge)
- **Login** button (if not logged in)
- **User email + Logout** (if logged in)

**Note:** Admin users see an additional "Admin" link in the navigation.

## What Normal Users CANNOT Do

❌ Access admin panel (`/admin/*`)
❌ See admin navigation links
❌ Create/edit/delete products
❌ Manage categories
❌ View/manage orders
❌ Upload product images

## Optional: User Accounts

Users can optionally create accounts:
- **Sign Up** (`/signup`): Create account (default role: "user")
- **Login** (`/login`): Sign in to existing account

**Why create an account?**
- Currently, accounts are optional
- Future features could include:
  - Order history
  - Saved addresses
  - Wishlist
  - Faster checkout

## User Flow Example

1. **User visits homepage** → Sees featured products and categories
2. **Clicks "Products"** → Browses all products
3. **Searches for "costume"** → Sees filtered results
4. **Clicks a product** → Views product details
5. **Selects size/color** → Chooses quantity
6. **Clicks "Add to Cart"** → Item added to cart
7. **Clicks cart icon** → Views cart
8. **Fills order form** → Enters shipping info
9. **Clicks "Place Order"** → Order submitted
10. **Order appears in admin panel** → Admin can view and process

## Key Features for Users

### ✅ No Payment Required
- Orders are submitted without payment
- Admin receives order notification
- Admin can contact customer for payment/processing

### ✅ Session-Based Cart
- Cart stored in browser (localStorage)
- Persists across page refreshes
- Cleared after order submission
- Works without login

### ✅ Easy Navigation
- Sticky header (always visible)
- Clear navigation links
- Search bar in header
- Cart icon with item count

### ✅ Mobile Responsive
- Works on phones, tablets, and desktops
- Responsive product grids
- Mobile-friendly forms

## Summary

**Normal users experience:**
- ✅ Full browsing access (no login needed)
- ✅ Search and filter products
- ✅ Add to cart and place orders
- ✅ Clean, easy-to-use interface
- ❌ No admin features visible
- ❌ Cannot manage products/categories

The website is designed to be **user-friendly** and **accessible to everyone** - no barriers to shopping!


