"use client"

import { useState } from 'react'
import {
  InventoryItem,
  InventoryCategory,
  InventoryStatus,
  CATEGORY_LABELS,
  STATUS_LABELS,
  CATEGORY_COLORS,
  STATUS_COLORS,
} from '@/types/inventory'
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Package,
  Monitor,
  Printer,
  Wifi,
  Speaker,
  Mouse,
  FileCode,
  Armchair,
  MoreHorizontal,
} from 'lucide-react'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  title?: string
}

const getCategoryIcon = (category: InventoryCategory) => {
  const iconProps = { className: "w-5 h-5" }
  switch (category) {
    case 'computer':
      return <Monitor {...iconProps} />
    case 'monitor':
      return <Monitor {...iconProps} />
    case 'printer':
      return <Printer {...iconProps} />
    case 'networking':
      return <Wifi {...iconProps} />
    case 'audio-visual':
      return <Speaker {...iconProps} />
    case 'peripheral':
      return <Mouse {...iconProps} />
    case 'software':
      return <FileCode {...iconProps} />
    case 'furniture':
      return <Armchair {...iconProps} />
    default:
      return <Package {...iconProps} />
  }
}

export default function InventoryTable({
  items,
  onEdit,
  onDelete,
  title = "Inventory Items"
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof InventoryItem>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'all'>('all')

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.assetTag?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Category', 'Manufacturer', 'Model', 'Serial Number', 'Asset Tag', 'Purchase Date', 'Purchase Price', 'Warranty Expiration', 'Assigned To', 'Location', 'Department', 'Status', 'Notes']
    const csvData = sortedItems.map(item => [
      item.name,
      CATEGORY_LABELS[item.category],
      item.manufacturer || '',
      item.model || '',
      item.serialNumber || '',
      item.assetTag || '',
      item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '',
      item.purchasePrice?.toFixed(2) || '',
      item.warrantyExpiration ? new Date(item.warrantyExpiration).toLocaleDateString() : '',
      item.assignedTo || '',
      item.location || '',
      item.department || '',
      STATUS_LABELS[item.status],
      item.notes || ''
    ])

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: InventoryStatus) => {
    const colors: Record<InventoryStatus, string> = {
      'active': 'bg-green-50 text-green-700 border-green-200',
      'in-storage': 'bg-blue-50 text-blue-700 border-blue-200',
      'needs-repair': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'retired': 'bg-gray-50 text-gray-700 border-gray-200',
      'on-order': 'bg-purple-50 text-purple-700 border-purple-200',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    )
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  // Calculate total value of filtered items
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-uva-navy">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {sortedItems.length} of {items.length} items
            {totalValue > 0 && (
              <span className="ml-2 font-semibold text-green-600">
                (Total: {formatCurrency(totalValue)})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-uva-orange transition-colors"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-uva-orange text-white rounded-lg font-semibold
                     hover:bg-uva-orange-light transition-colors flex items-center gap-2
                     justify-center whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | 'all')}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold
                   focus:border-uva-orange focus:outline-none transition-colors bg-white"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | 'all')}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold
                   focus:border-uva-orange focus:outline-none transition-colors bg-white"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-uva-navy w-8"></th>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Item {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-uva-navy">
                Asset Tag
              </th>
              <th
                onClick={() => handleSort('purchasePrice')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Price {sortField === 'purchasePrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('assignedTo')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Assigned To {sortField === 'assignedTo' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-uva-navy">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <>
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleRow(item.id)}
                        className="text-gray-500 hover:text-uva-navy transition-colors"
                      >
                        {expandedRows.has(item.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}20`, color: CATEGORY_COLORS[item.category] }}
                        >
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="font-medium text-uva-navy">{item.name}</div>
                          {item.manufacturer && item.model && (
                            <div className="text-xs text-gray-500">{item.manufacturer} {item.model}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {item.assetTag || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(item.purchasePrice)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.assignedTo || '-'}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedRows.has(item.id) && (
                    <tr key={`${item.id}-details`} className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Item Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Item Details</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">ID:</span> <span className="text-gray-600 font-mono text-xs">{item.id}</span></div>
                              <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-600">{item.name}</span></div>
                              <div><span className="font-medium text-gray-700">Manufacturer:</span> <span className="text-gray-600">{item.manufacturer || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Model:</span> <span className="text-gray-600">{item.model || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Serial Number:</span> <span className="text-gray-600 font-mono">{item.serialNumber || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Asset Tag:</span> <span className="text-gray-600 font-mono">{item.assetTag || 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Purchase & Warranty */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Purchase & Warranty</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">Purchase Date:</span> <span className="text-gray-600">{formatDate(item.purchaseDate)}</span></div>
                              <div><span className="font-medium text-gray-700">Purchase Price:</span> <span className="text-green-600 font-semibold">{formatCurrency(item.purchasePrice)}</span></div>
                              <div><span className="font-medium text-gray-700">Warranty Expires:</span> <span className="text-gray-600">{formatDate(item.warrantyExpiration)}</span></div>
                            </div>
                          </div>

                          {/* Assignment */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Assignment</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">Assigned To:</span> <span className="text-gray-600">{item.assignedTo || 'Unassigned'}</span></div>
                              <div><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-600">{item.location || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Department:</span> <span className="text-gray-600">{item.department || 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Status & Dates */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Status & Dates</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">Status:</span> {getStatusBadge(item.status)}</div>
                              <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-600">{formatDate(item.createdAt)}</span></div>
                              <div><span className="font-medium text-gray-700">Updated:</span> <span className="text-gray-600">{formatDate(item.updatedAt)}</span></div>
                            </div>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-3">
                              <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Notes</h4>
                              <p className="text-sm text-gray-600">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
