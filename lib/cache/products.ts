// Client-side cache for products data
// This allows instant navigation without showing loading skeletons

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 50 // Maximum number of cached queries

interface CacheEntry {
  data: any
  timestamp: number
  key: string
}

class ProductsCache {
  private cache: Map<string, CacheEntry> = new Map()

  getKey(search?: string, category?: string): string {
    return JSON.stringify({ search: search || '', category: category || '' })
  }

  get(search?: string, category?: string): any | null {
    const key = this.getKey(search, category)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(search: string | undefined, category: string | undefined, data: any): void {
    const key = this.getKey(search, category)
    
    // Limit cache size
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // Prefetch products data
  async prefetch(search?: string, category?: string): Promise<void> {
    const key = this.getKey(search, category)
    
    // Don't prefetch if already cached
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return
      }
    }

    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      
      const url = `/api/products?${params.toString()}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        this.set(search, category, data)
      }
    } catch (error) {
      console.error('Failed to prefetch products:', error)
    }
  }
}

export const productsCache = new ProductsCache()

