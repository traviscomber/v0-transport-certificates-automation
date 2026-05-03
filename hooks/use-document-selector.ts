import { useState, useMemo } from 'react'
import { DOCUMENT_TYPES, DocumentType, DocumentTag } from '@/lib/documents-config'

export function useDocumentSelector() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<DocumentTag[]>([])

  // Get unique categories and tags
  const categories = useMemo(() => {
    const cats = new Set<string>()
    DOCUMENT_TYPES.forEach(doc => {
      cats.add(doc.category)
    })
    return Array.from(cats).sort()
  }, [])

  const availableTags = useMemo(() => {
    const tags = new Set<DocumentTag>()
    DOCUMENT_TYPES.forEach(doc => {
      doc.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return DOCUMENT_TYPES.filter(doc => {
      // Filter by category
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false
      }

      // Filter by tags
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => 
          doc.tags?.includes(tag)
        )
        if (!hasAllTags) return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.id.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [selectedCategory, selectedTags, searchQuery])

  const toggleTag = (tag: DocumentTag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTags([])
  }

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    toggleTag,
    categories,
    availableTags,
    filteredDocuments,
    clearFilters,
  }
}
