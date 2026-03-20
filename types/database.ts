export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  seo_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  price: number | null
  wholesale_price: number | null
  quantity: number | null
  size: string | null
  is_active: boolean
  deleted_at: string | null // Timestamp when product was soft deleted
  seo_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export type Banner = {
  id: string
  desktop_image_url: string
  mobile_image_url: string
  link_url: string | null
  alt_text: string | null
  sort_order: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean
  order: number
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  sku: string | null
  size: string | null
  color: string | null
  quantity: number | null
  price_override: number | null
  wholesale_price_override: number | null
  created_at: string
  updated_at: string
}

export type PricingMode = 'retail' | 'wholesale'

export type Order = {
  id: string
  user_id: string | null
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: Record<string, any>
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled'
  total_amount: number
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null // Can be null if product is deleted
  variant_id: string | null
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  price: number
  created_at: string
}

export type ProductCategoryJunction = {
  id: string
  product_id: string
  category_id: string
  category: Category
  created_at: string
}

export type ProductWithDetails = Product & {
  category: Category | null // Keep for backward compatibility
  categories?: ProductCategoryJunction[] // New: multiple categories
  images: ProductImage[]
  variants: ProductVariant[]
}

export type CartItem = {
  productId: string
  variantId?: string
  name: string
  image: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export type SearchProductResult = {
  id: string
  name: string
  slug: string
  price: number | null
  image_url: string | null
  category_name: string | null
}

export type SearchCategoryResult = {
  id: string
  name: string
  slug: string
  product_count: number
}

export type SearchResults = {
  products: SearchProductResult[]
  categories: SearchCategoryResult[]
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  language: 'en' | 'hi'
  content: string
  excerpt: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ProductReview = {
  id: string
  product_id: string
  rating: number
  review_text: string | null
  author_name: string | null
  created_at: string
}

export type Faq = {
  id: string
  section: string
  question: string
  answer: string
  sort_order: number
  is_published: boolean
  show_on_blog: boolean
  show_on_category: boolean
  category_slugs: string[] | null
  created_at: string
  updated_at: string
}

