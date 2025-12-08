"use client"

import { useState, useEffect } from 'react'
import {
  InventoryItem,
  InventoryCategory,
  InventoryStatus,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '@/types/inventory'
import { X, Save } from 'lucide-react'

interface InventoryFormProps {
  item?: InventoryItem | null
  onSave: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void
  onClose: () => void
}

export default function InventoryForm({ item, onSave, onClose }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'computer' as InventoryCategory,
    manufacturer: '',
    model: '',
    serialNumber: '',
    assetTag: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiration: '',
    assignedTo: '',
    location: '',
    department: '',
    status: 'active' as InventoryStatus,
    notes: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        manufacturer: item.manufacturer || '',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        assetTag: item.assetTag || '',
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: item.purchasePrice?.toString() || '',
        warrantyExpiration: item.warrantyExpiration ? new Date(item.warrantyExpiration).toISOString().split('T')[0] : '',
        assignedTo: item.assignedTo || '',
        location: item.location || '',
        department: item.department || '',
        status: item.status,
        notes: item.notes || '',
      })
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const itemData = {
      ...(item?.id && { id: item.id }),
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      serialNumber: formData.serialNumber || undefined,
      assetTag: formData.assetTag || undefined,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      warrantyExpiration: formData.warrantyExpiration ? new Date(formData.warrantyExpiration) : undefined,
      assignedTo: formData.assignedTo || undefined,
      location: formData.location || undefined,
      department: formData.department || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
    }

    onSave(itemData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-uva-navy">
            {item ? 'Edit Inventory Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dell Monitor 27&quot;"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors bg-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Dell, Apple, HP"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., U2722D, MacBook Pro 16&quot;"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="e.g., ABC123XYZ"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                <input
                  type="text"
                  name="assetTag"
                  value={formData.assetTag}
                  onChange={handleChange}
                  placeholder="e.g., UVA-2024-0001"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Purchase & Warranty */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Purchase & Warranty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiration</label>
                <input
                  type="date"
                  name="warrantyExpiration"
                  value={formData.warrantyExpiration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Room 301, Building A"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., IT, Marketing"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Status & Notes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors bg-white"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional notes about this item..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:border-uva-orange transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-200 rounded-lg font-semibold
                       text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-uva-orange text-white rounded-lg font-semibold
                       hover:bg-uva-orange-light transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
