'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PricingMode } from '@/types/database'

interface PricingModeContextType {
    mode: PricingMode
    setMode: (mode: PricingMode) => void
    /** False until the saved mode has been read from localStorage (first client effect). */
    ready: boolean
}

const PricingModeContext = createContext<PricingModeContextType | null>(null)

const STORAGE_KEY = 'modfancy_pricing_mode'

export function PricingModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<PricingMode>('retail')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as PricingMode | null
            if (stored === 'wholesale' || stored === 'retail') {
                setModeState(stored)
            }
        } catch { }
        setMounted(true)
    }, [])

    const setMode = useCallback((newMode: PricingMode) => {
        setModeState(newMode)
        try {
            localStorage.setItem(STORAGE_KEY, newMode)
        } catch { }
    }, [])

    return (
        <PricingModeContext.Provider value={{ mode, setMode, ready: mounted }}>
            {children}
        </PricingModeContext.Provider>
    )
}

export function usePricingMode(): PricingModeContextType {
    const ctx = useContext(PricingModeContext)
    if (!ctx) {
        // Fallback if used outside provider (e.g., admin pages)
        return { mode: 'retail', setMode: () => { }, ready: true }
    }
    return ctx
}
