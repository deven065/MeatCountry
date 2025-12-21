"use client"
import { useState, useCallback } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type FilterState = {
  priceRange: [number, number]
  categories: string[]
  rating: number | null
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular'
}

type Props = {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  categories: { id: string; name: string }[]
}

export default function ProductFilters({ filters, onFilterChange, categories }: Props) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'category', 'rating', 'sort'])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }, [])

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }, [filters, onFilterChange])

  const toggleCategory = useCallback((categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId]
    updateFilter('categories', newCategories)
  }, [filters.categories, updateFilter])

  const clearAllFilters = useCallback(() => {
    onFilterChange({
      priceRange: [0, 10000],
      categories: [],
      rating: null,
      sortBy: 'popular'
    })
  }, [onFilterChange])

  const activeFilterCount = 
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.rating !== null ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3"
        >
          Sort By
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              expandedSections.includes('sort') ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.includes('sort') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest First' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-brand-600">
                    {option.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3"
        >
          Price Range
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              expandedSections.includes('price') ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.includes('price') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])
                  }
                  placeholder="Min"
                  className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:outline-none text-sm"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 5000])
                  }
                  placeholder="Max"
                  className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:outline-none text-sm"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories - Hidden since already filtered by page URL */}
      {/* 
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3"
        >
          Categories
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              expandedSections.includes('category') ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.includes('category') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 max-h-64 overflow-y-auto"
            >
              {categories.map(category => (
                <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-brand-600">
                    {category.name}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      */}

      {/* Rating */}
      <div className="border-t pt-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left font-semibold text-lg mb-3"
        >
          Minimum Rating
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              expandedSections.includes('rating') ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.includes('rating') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.rating === rating}
                    onChange={() => updateFilter('rating', rating)}
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-brand-600">
                    <span className="text-yellow-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
                    <span>& Up</span>
                  </span>
                </label>
              ))}
              <button
                onClick={() => updateFilter('rating', null)}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear rating filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <div className="border-t pt-6">
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors"
          >
            Clear All Filters ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full shadow-lg transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600" />
                </button>
              </div>
              <div className="p-6">
                <FilterContent />
              </div>
              <div className="sticky bottom-0 bg-white border-t p-4">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
