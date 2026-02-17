'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EnquiryList } from '@/components/admin/EnquiryList'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnquiries = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('wholesale_enquiries')
                .select('*')
                .order('created_at', { ascending: false })
            setEnquiries(data || [])
            setLoading(false)
        }
        fetchEnquiries()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="px-4 md:px-0 bg-white">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Wholesale Enquiries</h1>
            <EnquiryList enquiries={enquiries} />
        </div>
    )
}
