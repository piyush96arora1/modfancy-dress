'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Upload, FileText, Download, Trash2, Share2 } from 'lucide-react'

interface Catalogue {
    id: string
    title: string
    file_url: string
    file_name: string
    file_size: number
    created_at: string
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminCataloguesPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [catalogues, setCatalogues] = useState<Catalogue[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [title, setTitle] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchCatalogues = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('catalogues')
            .select('*')
            .order('created_at', { ascending: false })
        setCatalogues(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchCatalogues()
    }, [])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !title.trim()) return

        setUploading(true)
        const supabase = createClient()

        // Upload file to storage
        const timestamp = Date.now()
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${timestamp}_${safeName}`

        const { error: uploadError } = await supabase.storage
            .from('catalogues')
            .upload(filePath, selectedFile, {
                contentType: 'application/pdf',
                upsert: false,
            })

        if (uploadError) {
            alert(`Upload failed: ${uploadError.message}`)
            setUploading(false)
            return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('catalogues')
            .getPublicUrl(filePath)

        // Insert into DB
        const { error: dbError } = await supabase.from('catalogues').insert({
            title: title.trim(),
            file_url: publicUrl,
            file_name: selectedFile.name,
            file_size: selectedFile.size,
        })

        if (dbError) {
            alert(`Failed to save catalogue: ${dbError.message}`)
            setUploading(false)
            return
        }

        // Reset form & refresh
        setTitle('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setUploading(false)
        fetchCatalogues()
    }

    const handleDelete = async (catalogue: Catalogue) => {
        if (!confirm(`Delete "${catalogue.title}"? The PDF file will also be removed.`)) return

        setDeleting(catalogue.id)
        const supabase = createClient()

        // Extract file path from URL
        const urlParts = catalogue.file_url.split('/catalogues/')
        const storagePath = urlParts[urlParts.length - 1]

        // Delete from storage
        await supabase.storage.from('catalogues').remove([storagePath])

        // Delete from DB
        await supabase.from('catalogues').delete().eq('id', catalogue.id)

        setDeleting(null)
        fetchCatalogues()
    }

    const handleWhatsAppShare = (catalogue: Catalogue) => {
        const message = `📄 *${catalogue.title}*\n\nDownload PDF: ${catalogue.file_url}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="px-4 md:px-0 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">PDF Catalogues</h1>

            {/* Upload Form */}
            <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold text-lg mb-4 text-gray-900">Upload New Catalogue</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title / Description
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summer Collection 2026, Wedding Wear Catalogue"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-1">
                            PDF File (Max 10MB)
                        </label>
                        <input
                            id="pdf"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            required
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <Button type="submit" disabled={uploading || !title.trim() || !selectedFile}>
                        {uploading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Catalogue
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Catalogue List */}
            {catalogues.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No catalogues uploaded yet.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {catalogues.map((cat) => (
                                    <tr key={cat.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                                <span className="font-medium text-gray-900">{cat.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                                            {cat.file_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatFileSize(cat.file_size)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(cat.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <a href={cat.file_url} target="_blank" rel="noopener noreferrer" download>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4 mr-1" /> Download
                                                    </Button>
                                                </a>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleWhatsAppShare(cat)}
                                                    className="text-green-700 border-green-300 hover:bg-green-50"
                                                >
                                                    <Share2 className="w-4 h-4 mr-1" /> WhatsApp
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deleting === cat.id}
                                                    onClick={() => handleDelete(cat)}
                                                >
                                                    {deleting === cat.id ? '...' : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {catalogues.map((cat) => (
                            <div key={cat.id} className="bg-white rounded-lg border p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-10 h-10 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900">{cat.title}</div>
                                        <div className="text-xs text-gray-500 truncate mt-0.5">{cat.file_name}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {formatFileSize(cat.file_size)} · {new Date(cat.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t">
                                    <a href={cat.file_url} target="_blank" rel="noopener noreferrer" download className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Download className="w-4 h-4 mr-1" /> Download
                                        </Button>
                                    </a>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                                        onClick={() => handleWhatsAppShare(cat)}
                                    >
                                        <Share2 className="w-4 h-4 mr-1" /> WhatsApp
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={deleting === cat.id}
                                        onClick={() => handleDelete(cat)}
                                    >
                                        {deleting === cat.id ? '...' : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
