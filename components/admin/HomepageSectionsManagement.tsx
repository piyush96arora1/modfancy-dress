'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Save, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import type { HomepageSection } from '@/types/database'

type CategoryOption = { id: string; name: string; slug: string }

interface Props {
  initialSections: HomepageSection[]
  categories: CategoryOption[]
}

export function HomepageSectionsManagement({ initialSections, categories }: Props) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections)
  const [newDraft, setNewDraft] = useState<Partial<HomepageSection> | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const updateField = (id: string, field: keyof HomepageSection, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const next = { ...s, [field]: value } as HomepageSection
        // Latest sections have no category
        if (field === 'source_type' && value === 'latest') next.category_id = null
        return next
      })
    )
  }

  const move = (index: number, dir: 'up' | 'down') => {
    setSections((prev) => {
      const next = [...prev]
      const target = dir === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return
    const { error } = await supabase.from('homepage_sections').delete().eq('id', id)
    if (error) {
      alert('Error deleting section: ' + error.message)
      return
    }
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const clampCount = (n: number) => Math.max(1, Math.min(12, Math.round(n) || 1))

  const validate = (s: Partial<HomepageSection>): string | null => {
    if (!s.title || !s.title.trim()) return 'Every section needs a title.'
    if ((s.source_type ?? 'category') === 'category' && !s.category_id)
      return `Select a category for "${s.title}".`
    return null
  }

  const handleSave = async () => {
    // Validate all
    for (const s of sections) {
      const err = validate(s)
      if (err) return alert(err)
    }
    if (newDraft) {
      const err = validate(newDraft)
      if (err) return alert(err)
    }

    try {
      setSaving(true)

      if (sections.length > 0) {
        const { error } = await supabase.from('homepage_sections').upsert(
          sections.map((s, index) => ({
            ...s,
            sort_order: index,
            product_count: clampCount(s.product_count),
            updated_at: new Date().toISOString(),
          }))
        )
        if (error) throw error
      }

      if (newDraft) {
        const { error } = await supabase.from('homepage_sections').insert({
          title: newDraft.title!.trim(),
          source_type: newDraft.source_type ?? 'category',
          category_id: newDraft.source_type === 'latest' ? null : newDraft.category_id ?? null,
          product_count: clampCount(newDraft.product_count ?? 8),
          sort_order: sections.length,
          is_enabled: newDraft.is_enabled ?? true,
        })
        if (error) throw error
        setNewDraft(null)
      }

      // Push changes live immediately (bypass the 24h ISR window)
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => {})

      alert('Homepage sections saved!')
      window.location.reload()
    } catch (e) {
      alert('Error saving sections: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

  const renderFields = (
    s: Partial<HomepageSection>,
    onChange: (field: keyof HomepageSection, value: unknown) => void
  ) => {
    const sourceType = s.source_type ?? 'category'
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Section Title (shown to customers)</label>
          <input
            type="text"
            value={s.title ?? ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Independence Day Picks"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Products from</label>
          <select
            value={sourceType}
            onChange={(e) => onChange('source_type', e.target.value)}
            className={inputCls}
          >
            <option value="category">A category</option>
            <option value="latest">Latest products (New Arrivals)</option>
          </select>
        </div>
        {sourceType === 'category' ? (
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={s.category_id ?? ''}
              onChange={(e) => onChange('category_id', e.target.value || null)}
              className={inputCls}
            >
              <option value="">— Select a category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}
        <div>
          <label className={labelCls}>Number of products (1–12)</label>
          <input
            type="number"
            min={1}
            max={12}
            value={s.product_count ?? 8}
            onChange={(e) => onChange('product_count', Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">Sections</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {sections.length === 0 && !newDraft && (
        <p className="text-sm text-gray-500">No sections yet. Add one below.</p>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <span className="text-sm font-medium mr-2 text-gray-500">Row {index + 1}</span>
              <button
                onClick={() => move(index, 'up')}
                disabled={index === 0}
                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                aria-label="Move up"
              >
                <ArrowUp className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => move(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleDelete(section.id)}
                className="p-1.5 bg-red-50 border border-red-200 rounded hover:bg-red-100 ml-2"
                aria-label="Delete section"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => updateField(section.id, 'is_enabled', !section.is_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  section.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-label="Toggle visibility"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    section.is_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {section.is_enabled ? 'Shown on homepage' : 'Hidden'}
              </span>
            </div>

            {renderFields(section, (field, value) => updateField(section.id, field, value))}
          </div>
        ))}
      </div>

      {!newDraft ? (
        <Button
          variant="outline"
          className="w-full py-8 border-dashed"
          onClick={() => setNewDraft({ source_type: 'category', product_count: 8, is_enabled: true })}
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Section
        </Button>
      ) : (
        <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-indigo-900">New Section</h3>
            <button onClick={() => setNewDraft(null)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel">
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderFields(newDraft, (field, value) =>
            setNewDraft((prev) => {
              const next = { ...prev, [field]: value } as Partial<HomepageSection>
              if (field === 'source_type' && value === 'latest') next.category_id = null
              return next
            })
          )}
          <p className="text-xs text-indigo-600 mt-4 text-right">
            Click &quot;Save All&quot; above to publish this section.
          </p>
        </div>
      )}
    </div>
  )
}
