'use client'

import React, { useState, useRef, MouseEvent, TouchEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/lib/imageUrl'
import type { ProductImage } from '@/types/database'

interface ProductGalleryProps {
    images: ProductImage[]
    productName: string
}

const ZOOM_LEVEL = 2.5

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const primaryImage = images.find(img => img.is_primary) || images[0]
    const galleryImages = primaryImage
        ? [primaryImage, ...images.filter(img => img.id !== primaryImage.id)]
        : []

    const [selectedImage, setSelectedImage] = useState<ProductImage>(galleryImages[0])

    // Desktop Zoom State
    const [showDesktopZoom, setShowDesktopZoom] = useState(false)
    const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
    const [bgPos, setBgPos] = useState({ x: 0, y: 0 })
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    // Mobile Zoom State
    const [showMobileZoom, setShowMobileZoom] = useState(false)
    const [mobileBgPos, setMobileBgPos] = useState({ x: 50, y: 50 })

    const imageContainerRef = useRef<HTMLDivElement>(null)

    if (galleryImages.length === 0) return null

    // -- Desktop Handlers --
    const handleMouseEnter = () => setShowDesktopZoom(true)
    const handleMouseLeave = () => setShowDesktopZoom(false)

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return

        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()

        if (containerSize.width !== width) {
            setContainerSize({ width, height })
        }

        const lensWidth = width / ZOOM_LEVEL
        const lensHeight = height / ZOOM_LEVEL

        let x = e.clientX - left - lensWidth / 2
        let y = e.clientY - top - lensHeight / 2

        x = Math.max(0, Math.min(x, width - lensWidth))
        y = Math.max(0, Math.min(y, height - lensHeight))

        setLensPos({ x, y })

        // Background position percentage (0 to 100)
        // Prevent division by zero if width is abnormally equal to lensWidth
        const maxX = Math.max(1, width - lensWidth)
        const maxY = Math.max(1, height - lensHeight)
        const bgX = (x / maxX) * 100
        const bgY = (y / maxY) * 100
        setBgPos({ x: bgX, y: bgY })
    }

    // -- Mobile Handlers --
    const handleTouchStart = () => setShowMobileZoom(true)
    const handleTouchEnd = () => setShowMobileZoom(false)

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current || e.touches.length !== 1) return

        const touch = e.touches[0]
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()

        let xPct = ((touch.clientX - left) / width) * 100
        let yPct = ((touch.clientY - top) / height) * 100

        xPct = Math.max(0, Math.min(100, xPct))
        yPct = Math.max(0, Math.min(100, yPct))

        setMobileBgPos({ x: xPct, y: yPct })
    }

    const lensWidth = containerSize.width / ZOOM_LEVEL || 0
    const lensHeight = containerSize.height / ZOOM_LEVEL || 0

    return (
        <div className="flex flex-col gap-3 md:gap-4 relative">
            {/* Main Image Viewport */}
            <div
                ref={imageContainerRef}
                className="aspect-square relative bg-[#F5F3F0] rounded-xl overflow-hidden cursor-crosshair group touch-pan-y"
                style={{ boxShadow: 'var(--shadow-md)' }}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* The Base Image */}
                <Image
                    src={getImageUrl(selectedImage.image_url)}
                    alt={selectedImage.alt_text || `${productName} Main Image`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* --- DESKTOP LENS OVERLAY --- */}
                {showDesktopZoom && containerSize.width > 0 && (
                    <div
                        className="hidden md:block absolute bg-white/30 border border-[#C8956C]/60 pointer-events-none drop-shadow-sm transition-none"
                        style={{
                            left: lensPos.x,
                            top: lensPos.y,
                            width: lensWidth,
                            height: lensHeight
                        }}
                    />
                )}

                {/* --- MOBILE IN-PLACE ZOOM --- */}
                <div
                    className={cn(
                        "md:hidden absolute inset-0 pointer-events-none bg-[#F5F3F0] transition-opacity duration-200",
                        showMobileZoom ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                        backgroundImage: `url(${getImageUrl(selectedImage.image_url)})`,
                        backgroundPosition: `${mobileBgPos.x}% ${mobileBgPos.y}%`,
                        backgroundSize: `${ZOOM_LEVEL * 100}% ${ZOOM_LEVEL * 100}%`,
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </div>

            {/* --- DESKTOP SIDE ZOOM PANE --- */}
            {showDesktopZoom && containerSize.width > 0 && (
                <div
                    className="hidden md:block absolute z-50 bg-[#F5F3F0] rounded-xl overflow-hidden pointer-events-none border border-[#E8E5E0]"
                    style={{
                        left: 'calc(100% + 24px)', // Gap from the main image
                        top: 0,
                        width: '500px', // Large zoom pane
                        height: '500px',
                        boxShadow: 'var(--shadow-2xl)', /* large elevated drop shadow */
                        backgroundImage: `url(${getImageUrl(selectedImage.image_url)})`,
                        backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
                        backgroundSize: `${ZOOM_LEVEL * 100}% ${ZOOM_LEVEL * 100}%`,
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            {/* Thumbnails Row */}
            {galleryImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {galleryImages.map((img) => {
                        const isSelected = selectedImage.id === img.id
                        return (
                            <button
                                key={img.id}
                                onClick={() => setSelectedImage(img)}
                                className={cn(
                                    "relative aspect-square w-20 md:w-24 flex-shrink-0 bg-[#F5F3F0] rounded-lg overflow-hidden border-2 snap-center transition-all duration-200",
                                    isSelected
                                        ? "border-[#C8956C] ring-2 ring-[#C8956C]/20 shadow-sm"
                                        : "border-transparent border-[#E8E5E0] hover:border-[#C8956C]/50 opacity-70 hover:opacity-100"
                                )}
                                aria-label={`Select image ${img.order}`}
                            >
                                <Image
                                    src={getImageUrl(img.image_url)}
                                    alt={img.alt_text || `${productName} Thumbnail`}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
