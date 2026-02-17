'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface EnquiryItem {
    product_id: string
    product_name: string
    slug: string
    image_url: string | null
    quantity: number
    size: string | null
    wholesale_price: number
}

interface EnquiryBasketContextType {
    items: EnquiryItem[]
    addItem: (item: EnquiryItem) => void
    removeItem: (product_id: string) => void
    updateItem: (product_id: string, updates: Partial<Pick<EnquiryItem, 'quantity' | 'size'>>) => void
    clearBasket: () => void
    itemCount: number
    isInBasket: (product_id: string) => boolean
}

const EnquiryBasketContext = createContext<EnquiryBasketContextType | null>(null)

const STORAGE_KEY = 'modfancy_wholesale_enquiry_basket'

function loadFromStorage(): EnquiryItem[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveToStorage(items: EnquiryItem[]) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // localStorage full or unavailable — ignore
    }
}

export function EnquiryBasketProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<EnquiryItem[]>([])
    const [mounted, setMounted] = useState(false)

    // Load from localStorage after mount
    useEffect(() => {
        setItems(loadFromStorage())
        setMounted(true)
    }, [])

    // Persist on change (skip initial load)
    useEffect(() => {
        if (mounted) {
            saveToStorage(items)
        }
    }, [items, mounted])

    const addItem = useCallback((item: EnquiryItem) => {
        setItems((prev) => {
            // If product already in basket, update it
            const exists = prev.find((i) => i.product_id === item.product_id)
            if (exists) {
                return prev.map((i) =>
                    i.product_id === item.product_id ? { ...i, ...item } : i
                )
            }
            return [...prev, item]
        })
    }, [])

    const removeItem = useCallback((product_id: string) => {
        setItems((prev) => prev.filter((i) => i.product_id !== product_id))
    }, [])

    const updateItem = useCallback((product_id: string, updates: Partial<Pick<EnquiryItem, 'quantity' | 'size'>>) => {
        setItems((prev) =>
            prev.map((i) => (i.product_id === product_id ? { ...i, ...updates } : i))
        )
    }, [])

    const clearBasket = useCallback(() => {
        setItems([])
    }, [])

    const isInBasket = useCallback((product_id: string) => {
        return items.some((i) => i.product_id === product_id)
    }, [items])

    return (
        <EnquiryBasketContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateItem,
                clearBasket,
                itemCount: items.length,
                isInBasket,
            }}
        >
            {children}
        </EnquiryBasketContext.Provider>
    )
}

export function useEnquiryBasket() {
    const ctx = useContext(EnquiryBasketContext)
    if (!ctx) {
        throw new Error('useEnquiryBasket must be used within EnquiryBasketProvider')
    }
    return ctx
}
