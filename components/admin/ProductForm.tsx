'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ImageUpload } from './ImageUpload'
import { X, Plus } from 'lucide-react'
import { SIZE_OPTIONS } from '@/lib/constants/sizes'

// Helper to make string fields optional (empty string becomes undefined)
const optionalString = z.union([z.string(), z.literal('')]).transform(val => val === '' ? undefined : val).optional()

const variantSchema = z.object({
  sku: z.union([z.string(), z.literal(''), z.null()]).transform(val => (val === '' || val === null) ? undefined : val).optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.union([z.string(), z.literal(''), z.null()]).transform(val => (val === '' || val === null) ? undefined : val).optional(),
  quantity: z.union([z.number(), z.string(), z.literal(''), z.null()]).transform(val => {
    if (val === '' || val === null || val === undefined) return undefined
    if (typeof val === 'number') return val
    const num = Number(val)
    return isNaN(num) ? undefined : num
  }).optional(),
  price_override: z.union([z.number(), z.string(), z.literal(''), z.null()]).transform(val => {
    if (val === '' || val === null || val === undefined) return 0
    if (typeof val === 'number') return val
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }).default(0),
})

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().optional().nullable(), // Keep for backward compatibility
  category_ids: z.array(z.string()).optional(), // New: multiple categories
  price: z.number().optional().nullable(),
  wholesale_price: z.union([z.number(), z.string(), z.literal(''), z.null()]).transform(val => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'number') return val
    const num = Number(val)
    return isNaN(num) ? null : num
  }).optional().nullable(),
  quantity: z.number().optional().nullable(),
  size: z.string().optional().nullable(),
  is_active: z.boolean(),
  variants: z.array(variantSchema).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: any
  categories: Array<{ id: string; name: string }>
}

export function ProductForm({ product, categories: initialCategories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [customSizes, setCustomSizes] = useState<Record<number, boolean>>({})
  const [customProductSize, setCustomProductSize] = useState(false)
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean; order: number }>>(
    product?.images?.map((img: any) => ({
      url: img.image_url,
      isPrimary: img.is_primary,
      order: img.order,
    })) || []
  )
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    shouldFocusError: false, // Disable auto-focus on validation errors
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      category_id: product?.category_id || null,
      category_ids: product?.category_ids || [],
      price: product?.price || null,
      wholesale_price: product?.wholesale_price || null,
      quantity: product?.quantity || null,
      size: product?.size || null,
      is_active: product?.is_active ?? true,
      variants: product?.variants || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const name = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (!product && name) {
      setValue('slug', slugify(name))
    }
  }, [name, product, setValue])

  const handleImageUpload = (url: string) => {
    setImages([...images, { url, isPrimary: images.length === 0, order: images.length }])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSetPrimary = (index: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    )
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required')
      return
    }

    setCreatingCategory(true)
    try {
      const slug = slugify(newCategoryName)
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName.trim(),
          slug,
          description: newCategoryDescription.trim() || null,
        })
        .select()
        .single()

      if (error) throw error

      // Add to categories list
      setCategories([...categories, newCategory])

      // Add new category to selected categories
      const currentIds = watch('category_ids') || []
      setValue('category_ids', [...currentIds, newCategory.id])
      setValue('category_id', newCategory.id) // Also set for backward compatibility

      // Reset form
      setNewCategoryName('')
      setNewCategoryDescription('')
      setShowCategoryForm(false)
    } catch (error: any) {
      alert('Error creating category: ' + error.message)
    } finally {
      setCreatingCategory(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      alert('Please add at least one product image')
      return
    }

    // Validate variants: check for duplicate sizes
    if (data.variants && data.variants.length > 0) {
      const validVariants = data.variants.filter((variant) => {
        return variant.size || variant.price_override !== undefined
      })

      // Check for duplicate sizes
      const sizes = validVariants.map(v => v.size).filter(Boolean)
      const duplicateSizes = sizes.filter((size, index) => sizes.indexOf(size) !== index)

      if (duplicateSizes.length > 0) {
        alert(`Duplicate sizes found: ${[...new Set(duplicateSizes)].join(', ')}. Each variant must have a unique size.`)
        return
      }

      // Validate that each variant has both size and price_override
      const invalidVariants = validVariants.filter(v => !v.size || v.price_override === undefined)
      if (invalidVariants.length > 0) {
        alert('Each variant must have both size and price. Please fill in all required fields.')
        return
      }
    }

    setLoading(true)
    try {
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        category_id: data.category_ids && data.category_ids.length > 0 ? data.category_ids[0] : null, // Keep first category for backward compatibility
        price: data.price || null,
        wholesale_price: data.wholesale_price || null,
        quantity: data.quantity || null,
        size: data.size || null,
        is_active: data.is_active,
      }

      let productId: string

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
        productId = product.id

        // Delete existing images
        await supabase.from('product_images').delete().eq('product_id', productId)

        // Delete existing product_categories
        await supabase.from('product_categories').delete().eq('product_id', productId)
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        productId = newProduct.id
      }

      // Insert product categories (many-to-many)
      if (data.category_ids && data.category_ids.length > 0) {
        const categoryData = data.category_ids.map((categoryId: string) => ({
          product_id: productId,
          category_id: categoryId,
        }))

        const { error: categoryError } = await supabase
          .from('product_categories')
          .insert(categoryData)

        if (categoryError) throw categoryError
      }

      // Insert images
      const imageData = images.map((img, index) => ({
        product_id: productId,
        image_url: img.url,
        is_primary: img.isPrimary,
        order: index,
      }))

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageData)

      if (imageError) throw imageError

      // Handle variants - filter out completely empty variants
      if (product) {
        await supabase.from('product_variants').delete().eq('product_id', productId)
      }

      if (data.variants && data.variants.length > 0) {
        // Filter out variants that don't have required fields (size and price_override)
        const validVariants = data.variants.filter((variant) => {
          return variant.size && variant.price_override !== undefined
        })

        if (validVariants.length > 0) {
          const variantData = validVariants.map((variant) => ({
            product_id: productId,
            sku: variant.sku || null,
            size: variant.size, // Required, so always present
            color: variant.color || null,
            quantity: variant.quantity || null,
            price_override: variant.price_override, // Required, so always present
          }))

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantData)

          if (variantError) throw variantError
        }
      }

      // If opened in a new tab, refresh the parent window and close this tab
      if (typeof window !== 'undefined' && window.opener) {
        window.opener.location.reload()
        window.close()
      } else {
        // Normal navigation if not opened in a new tab
        router.push('/admin/products')
        router.refresh()
      }
    } catch (error: any) {
      let errorMessage = 'Unknown error occurred'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error) {
        errorMessage = JSON.stringify(error)
      }
      console.error('Error saving product:', error)
      alert('Error saving product: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)

    // Helper to safely convert any value to a string message
    const safeString = (val: any): string => {
      if (!val) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'number' || typeof val === 'boolean') return String(val)
      if (val.message && typeof val.message === 'string') return val.message
      if (Array.isArray(val) && val.length > 0) return safeString(val[0])
      try {
        const str = JSON.stringify(val)
        if (str && str !== '{}' && str !== '[]') return str
      } catch {
        // ignore
      }
      return ''
    }

    // Try to find the first meaningful error
    let errorMessage = 'Please check the form fields'
    let errorPath = ''
    let found = false

    const findFirstError = (obj: any, path: string = '') => {
      if (!obj || found) return

      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            if (item && !found) findFirstError(item, `${path}[${index}]`)
          })
        } else {
          // Check if this object has a message property (direct error)
          if ('message' in obj) {
            const msg = safeString(obj.message)
            if (msg && msg !== '[object Object]') {
              errorMessage = msg
              errorPath = path
              found = true
              return
            }
          }

          // Otherwise, recurse into properties
          Object.entries(obj).forEach(([key, value]) => {
            if (found) return
            const currentPath = path ? `${path}.${key}` : key
            if (value && typeof value === 'object') {
              findFirstError(value, currentPath)
            } else if (typeof value === 'string' && value) {
              errorMessage = value
              errorPath = currentPath
              found = true
              return
            }
          })
        }
      }
    }

    findFirstError(errors)

    // Final safety check
    if (errorMessage === '[object Object]' || !errorMessage) {
      errorMessage = 'Please check all required fields are filled correctly'
    }

    alert(`Please fix the form error${errorPath ? ` in "${errorPath}"` : ''}: ${errorMessage}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Product Name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="product-slug"
          />
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Categories (Select multiple)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryForm(!showCategoryForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            {showCategoryForm ? 'Cancel' : 'New Category'}
          </Button>
        </div>

        {showCategoryForm ? (
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <h4 className="font-medium mb-3">Create New Category</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new_category_name">Category Name *</Label>
                <Input
                  id="new_category_name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name"
                />
              </div>
              <div>
                <Label htmlFor="new_category_description">Description</Label>
                <Textarea
                  id="new_category_description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Category description (optional)"
                  rows={2}
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateCategory}
                loading={creatingCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                size="sm"
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-white">
            <div className="space-y-2">
              {categories.map((cat) => {
                const categoryIds = watch('category_ids') || []
                const isSelected = categoryIds.includes(cat.id)
                return (
                  <label
                    key={cat.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentIds = watch('category_ids') || []
                        if (e.target.checked) {
                          setValue('category_ids', [...currentIds, cat.id])
                        } else {
                          setValue('category_ids', currentIds.filter((id: string) => id !== cat.id))
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">{cat.name}</span>
                  </label>
                )
              })}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories available. Create one above.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Product description (optional)"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Retail Price <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="wholesale_price">
            Wholesale Price <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="wholesale_price"
            type="number"
            step="0.01"
            {...register('wholesale_price', { setValueAs: (v) => v === '' ? null : Number(v) })}
            placeholder={watch('price') ? `Auto: ₹${Math.round((watch('price') || 0) * 0.7)} (30% off)` : 'Enter wholesale price'}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-calculate (30% off retail). Enter a value to override.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Default Quantity <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="Leave empty if not tracking quantity"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use this for products without variants. Variants have their own quantities.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="size">Default Size <span className="text-gray-400 font-normal">(optional)</span></Label>
        {!customProductSize ? (
          <div className="space-y-2">
            <Select
              {...register('size', {
                onChange: (e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setCustomProductSize(true)
                    setValue('size', null, { shouldValidate: false })
                  }
                }
              })}
              value={watch('size') || ''}
              onChange={(e) => {
                if (e.target.value === '__CUSTOM__') {
                  setCustomProductSize(true)
                  setValue('size', null, { shouldValidate: false })
                } else {
                  setValue('size', e.target.value || null, { shouldValidate: true })
                }
              }}
            >
              <option value="">Select size or leave empty</option>
              {SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="size"
              {...register('size')}
              placeholder="Type custom size (e.g., 1-2 yrs, 12,14,16)"
            />
            <button
              type="button"
              onClick={() => {
                setCustomProductSize(false)
                setValue('size', '')
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Use predefined sizes instead
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Use this for products without variants. Variants have their own sizes.
        </p>
      </div>

      <div>
        <Label>
          <input
            type="checkbox"
            {...register('is_active')}
            className="mr-2"
          />
          Active
        </Label>
      </div>

      {/* Images */}
      <div>
        <Label>Product Images *</Label>
        <ImageUpload onUpload={handleImageUpload} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group border rounded-lg bg-gray-50 p-2 flex flex-col shadow-sm">
              <div className="aspect-square relative bg-white border rounded overflow-hidden mb-2">
                <img
                  src={img.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-0 right-0 p-1 flex items-start gap-1 justify-end w-full">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-white hover:bg-red-50 text-red-600 border border-gray-200 p-1.5 rounded-full shadow-sm"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-auto">
                {img.isPrimary ? (
                  <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1.5 rounded text-center block w-full">
                    Primary Image
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="w-full text-xs bg-white border border-gray-200 hover:bg-gray-100 px-2 py-1.5 rounded font-medium transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <p className="text-sm text-red-600 mt-1">At least one image is required</p>
        )}
      </div>

      {/* Variants */}
      <div className="mt-8 border-t pt-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div>
            <Label className="text-base font-semibold">Product Variants</Label>
            <p className="text-sm text-gray-500 mt-1">
              Optional - Only add if your product has different sizes, colors, SKUs, or quantities.
              You can skip this section entirely.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ size: '', price_override: 0 } as any)}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>
        {fields.length === 0 && (
          <p className="text-sm text-gray-400 italic mb-4">
            No variants added. Product will use the base price and no size/color options.
          </p>
        )}
        {fields.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            <strong>Note:</strong> Size and Price Override are <strong>required</strong> for each variant.
            SKU, Color, and Quantity are optional. Variants without size and price will be removed when saving.
            Each variant must have a unique size.
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Variant {index + 1}</h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>SKU <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  {...register(`variants.${index}.sku`)}
                  placeholder="Leave empty if not needed"
                />
              </div>
              <div>
                <Label>Size <span className="text-red-500">*</span></Label>
                {!customSizes[index] ? (
                  <div className="space-y-2">
                    <Select
                      {...register(`variants.${index}.size`, { required: 'Size is required' })}
                      value={watch(`variants.${index}.size`) || ''}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setCustomSizes({ ...customSizes, [index]: true })
                          setValue(`variants.${index}.size`, '', { shouldValidate: true })
                        } else {
                          setValue(`variants.${index}.size`, e.target.value || '', { shouldValidate: true })
                        }
                      }}
                    >
                      <option value="">Select size (required)</option>
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {errors.variants?.[index]?.size && (
                      <p className="text-sm text-red-600 mt-1">{errors.variants[index]?.size?.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      {...register(`variants.${index}.size`, { required: 'Size is required' })}
                      placeholder="Type custom size (e.g., 1-2 yrs, 12,14,16)"
                    />
                    {errors.variants?.[index]?.size && (
                      <p className="text-sm text-red-600 mt-1">{errors.variants[index]?.size?.message}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomSizes({ ...customSizes, [index]: false })
                        setValue(`variants.${index}.size`, undefined)
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Use predefined sizes instead
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label>Color <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  {...register(`variants.${index}.color`)}
                  placeholder="Leave empty if not needed"
                />
              </div>
              <div>
                <Label>Quantity <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  type="number"
                  min="0"
                  {...register(`variants.${index}.quantity`, {
                    setValueAs: (value) => {
                      if (value === '' || value === null || value === undefined) return undefined
                      const num = Number(value)
                      return isNaN(num) ? undefined : num
                    }
                  })}
                  placeholder="Leave empty if not needed"
                />
                {errors.variants?.[index]?.quantity && (
                  <p className="text-sm text-red-600 mt-1">{String(errors.variants[index]?.quantity?.message || 'Invalid quantity')}</p>
                )}
              </div>
              <div>
                <Label>Price Override <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`variants.${index}.price_override`, {
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' || isNaN(value) ? undefined : Number(value),
                    required: 'Price is required'
                  })}
                  placeholder="Enter price (required)"
                />
                {errors.variants?.[index]?.price_override && (
                  <p className="text-sm text-red-600 mt-1">{errors.variants[index]?.price_override?.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}





