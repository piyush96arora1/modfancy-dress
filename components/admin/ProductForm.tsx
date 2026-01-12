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
  sku: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().optional(),
  price_override: z.number().optional(),
})

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
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
    resolver: zodResolver(productSchema),
    shouldFocusError: false, // Disable auto-focus on validation errors
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      category_id: product?.category_id || null,
      price: product?.price || null,
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
      
      // Set as selected category
      setValue('category_id', newCategory.id)
      
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

    setLoading(true)
    try {
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        category_id: data.category_id || null,
        price: data.price || null,
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
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        productId = newProduct.id
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
        // Filter out variants that have no data at all
        const validVariants = data.variants.filter((variant) => {
          return variant.sku || variant.size || variant.color || variant.quantity || variant.price_override
        })

        if (validVariants.length > 0) {
          const variantData = validVariants.map((variant) => ({
            product_id: productId,
            sku: variant.sku || null,
            size: variant.size || null,
            color: variant.color || null,
            quantity: variant.quantity || null,
            price_override: variant.price_override || null,
          }))

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantData)

          if (variantError) throw variantError
        }
      }

      router.push('/admin/products')
      router.refresh()
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
    // Extract first error message from React Hook Form error structure
    const getErrorMessage = (error: any): string => {
      if (!error) return 'Invalid field'
      if (typeof error === 'string') return error
      if (error.message) return error.message
      if (error._errors && Array.isArray(error._errors) && error._errors.length > 0) {
        return error._errors[0]
      }
      // For nested objects, try to find a message
      const values = Object.values(error)
      for (const val of values) {
        if (typeof val === 'string') return val
        if (val && typeof val === 'object' && 'message' in val && typeof val.message === 'string') {
          return val.message
        }
      }
      return 'Please check the form fields'
    }
    
    const firstErrorKey = Object.keys(errors)[0]
    const firstError = errors[firstErrorKey]
    const errorMessage = getErrorMessage(firstError)
    
    alert(`Please fix the form error in "${firstErrorKey}": ${errorMessage}`)
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
          <Label htmlFor="category_id">Category</Label>
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
                disabled={creatingCategory || !newCategoryName.trim()}
                size="sm"
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        ) : (
          <Select
            id="category_id"
            {...register('category_id')}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
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
          <Label htmlFor="price">Price <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
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
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                <img
                  src={img.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {img.isPrimary && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  className="mt-2 w-full text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Set Primary
                </button>
              )}
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <p className="text-sm text-red-600 mt-1">At least one image is required</p>
        )}
      </div>

      {/* Variants */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <Label>Product Variants</Label>
            <p className="text-sm text-gray-500 mt-1">
              Optional - Only add if your product has different sizes, colors, SKUs, or quantities. 
              You can skip this section entirely.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({})}
          >
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
            <strong>Note:</strong> All variant fields are optional. You can leave any field empty. 
            Empty variants (with no data) will be automatically removed when saving.
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
                <Label>Size <span className="text-gray-400 font-normal">(optional)</span></Label>
                {!customSizes[index] ? (
                  <div className="space-y-2">
                    <Select
                      {...register(`variants.${index}.size`)}
                      value={watch(`variants.${index}.size`) || ''}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setCustomSizes({ ...customSizes, [index]: true })
                          setValue(`variants.${index}.size`, undefined, { shouldValidate: true })
                        } else {
                          setValue(`variants.${index}.size`, e.target.value || undefined, { shouldValidate: true })
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
                      {...register(`variants.${index}.size`)}
                      placeholder="Type custom size (e.g., 1-2 yrs, 12,14,16)"
                    />
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
                  {...register(`variants.${index}.quantity`, { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' || isNaN(value) ? undefined : Number(value)
                  })}
                  placeholder="Leave empty if not needed"
                />
              </div>
              <div>
                <Label>Price Override <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`variants.${index}.price_override`, { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' || isNaN(value) ? undefined : Number(value)
                  })}
                  placeholder="Leave empty to use base price"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
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





