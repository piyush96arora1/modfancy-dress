'use client'

import { useState, useRef } from 'react'
import { uploadCompressedImage, type UploadFolder } from '@/lib/utils/upload'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  bucket?: string
  pathPrefix?: string
  label?: string
}

export function ImageUpload({
  onUpload,
  bucket = 'product-images',
  pathPrefix = 'products-webp/',
  label = 'Upload Image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = e.target.files[0]

      // Map pathPrefix to UploadFolder type
      const folder = pathPrefix.replace('/', '') as UploadFolder

      const publicUrl = await uploadCompressedImage(file, folder)

      onUpload(publicUrl)

      // Reset file input so same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={handleButtonClick}
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : label}
      </Button>
    </div>
  )
}





