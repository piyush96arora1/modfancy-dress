import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customer_name, customer_phone, customer_email, message, products } = body

        if (!customer_name || !customer_phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'At least one product is required' }, { status: 400 })
        }

        // Use a direct Supabase client (not cookie-based) since this is a public insert
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { error } = await supabase
            .from('wholesale_enquiries')
            .insert({
                customer_name,
                customer_phone,
                customer_email: customer_email || null,
                message: message || null,
                products,
                status: 'new',
            })

        if (error) {
            console.error('Error creating wholesale enquiry:', error)
            return NextResponse.json({ error: 'Failed to submit enquiry: ' + error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in wholesale enquiry API:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}
