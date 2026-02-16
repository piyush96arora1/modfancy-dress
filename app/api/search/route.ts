import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')?.trim()

        if (!q || q.length < 3) {
            return NextResponse.json({ products: [], categories: [] })
        }

        const supabase = await createClient()

        const { data, error } = await supabase.rpc('search_products_and_categories', {
            search_term: q,
            result_limit: 6,
        })

        if (error) {
            console.error('Search RPC error:', error)
            return NextResponse.json({ products: [], categories: [] }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Search API error:', error)
        return NextResponse.json({ products: [], categories: [] }, { status: 500 })
    }
}
