"use client"

import { useState } from 'react'
import {
  LoanerLaptop,
  LoanerStatus,
  LoanHistory,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from '@/types/loaner'
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Laptop,
  RotateCcw,
  UserCheck,
  History,
  Mail,
} from 'lucide-react'
import LoanerHistoryModal from './LoanerHistoryModal'

interface LoanerTableProps {
  loaners: LoanerLaptop[]
  loanHistory: LoanHistory[]
  onEdit: (loaner: LoanerLaptop) => void
  onDelete: (id: string) => void
  onCheckout: (loaner: LoanerLaptop) => void
  onReturn: (loaner: LoanerLaptop) => void
  title?: string
}

export default function LoanerTable({
  loaners,
  loanHistory,
  onEdit,
  onDelete,
  onCheckout,
  onReturn,
  title = "Loaner Laptops"
}: LoanerTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof LoanerLaptop>('assetTag')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<LoanerStatus | 'all'>('all')
  const [historyLoaner, setHistoryLoaner] = useState<LoanerLaptop | null>(null)

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Filter loaners
  const filteredLoaners = loaners.filter(loaner => {
    const matchesSearch =
      loaner.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loaner.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loaner.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loaner.model?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || loaner.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort loaners
  const sortedLoaners = [...filteredLoaners].sort((a, b) => {
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

    return 0
  })

  const handleSort = (field: keyof LoanerLaptop) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    const headers = ['Asset Tag', 'Name', 'Manufacturer', 'Model', 'Serial Number', 'Status', 'Borrower', 'Borrower Email', 'Department', 'Checkout Date', 'Expected Return', 'Notes']
    const csvData = sortedLoaners.map(loaner => [
      loaner.assetTag,
      loaner.name,
      loaner.manufacturer || '',
      loaner.model || '',
      loaner.serialNumber || '',
      STATUS_LABELS[loaner.status],
      loaner.borrowerName || '',
      loaner.borrowerEmail || '',
      loaner.borrowerDepartment || '',
      loaner.checkoutDate ? new Date(loaner.checkoutDate).toLocaleDateString() : '',
      loaner.expectedReturnDate ? new Date(loaner.expectedReturnDate).toLocaleDateString() : '',
      loaner.notes || ''
    ])

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loaner-laptops-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: LoanerStatus) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE_CLASSES[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    )
  }

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const isOverdue = (loaner: LoanerLaptop) => {
    if (loaner.status !== 'checked-out' || !loaner.expectedReturnDate) return false
    return new Date(loaner.expectedReturnDate) < new Date()
  }

  const getHistoryCount = (loanerId: string) => {
    return loanHistory.filter(h => h.loanerId === loanerId).length
  }

  const getLoanerHistory = (loanerId: string) => {
    return loanHistory.filter(h => h.loanerId === loanerId)
  }

  // Generate mailto link for reminder email
  const getReminderEmailLink = (loaner: LoanerLaptop) => {
    if (!loaner.borrowerEmail) return null

    const isOverdueDevice = isOverdue(loaner)
    const subject = encodeURIComponent(
      isOverdueDevice
        ? `OVERDUE: Loaner Device Return Required - ${loaner.name}`
        : `Reminder: Loaner Device Return - ${loaner.name}`
    )
    const body = encodeURIComponent(
`Hi ${loaner.borrowerName},

${isOverdueDevice ? 'This is an urgent reminder that your loaner device is OVERDUE for return.' : 'This is a friendly reminder about your loaner device.'}

Device: ${loaner.name}
Asset Tag: ${loaner.assetTag}
Expected Return Date: ${loaner.expectedReturnDate ? new Date(loaner.expectedReturnDate).toLocaleDateString() : 'As soon as possible'}
${isOverdueDevice ? '\nPlease return this device immediately.' : ''}

Please return the device to Batten IT at your earliest convenience.

If you need to extend your loan period, please reply to this email or contact us.

Thank you,
Batten IT
battensupport@virginia.edu | (434) 924-0812
`)
    return `mailto:${loaner.borrowerEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-uva-navy">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {sortedLoaners.length} of {loaners.length} loaners
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search loaners..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LoanerStatus | 'all')}
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
                onClick={() => handleSort('assetTag')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Asset Tag {sortField === 'assetTag' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Device {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('borrowerName')}
                className="px-4 py-3 text-left text-sm font-semibold text-uva-navy cursor-pointer hover:bg-gray-100"
              >
                Borrower {sortField === 'borrowerName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-uva-navy">
                Expected Return
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-uva-navy">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedLoaners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No loaner laptops found
                </td>
              </tr>
            ) : (
              sortedLoaners.map((loaner) => (
                <>
                  <tr key={loaner.id} className={`hover:bg-gray-50 transition-colors ${isOverdue(loaner) ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleRow(loaner.id)}
                        className="text-gray-500 hover:text-uva-navy transition-colors"
                      >
                        {expandedRows.has(loaner.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono font-semibold text-uva-navy">{loaner.assetTag}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-uva-navy">{loaner.name}</div>
                          {loaner.manufacturer && loaner.model && (
                            <div className="text-xs text-gray-500">{loaner.manufacturer} {loaner.model}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(loaner.status)}
                      {isOverdue(loaner) && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {loaner.borrowerName || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(loaner.expectedReturnDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {loaner.status === 'available' && (
                          <button
                            onClick={() => onCheckout(loaner)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Check Out"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {loaner.status === 'checked-out' && (
                          <>
                            <button
                              onClick={() => onReturn(loaner)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Return"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            {loaner.borrowerEmail && (
                              <a
                                href={getReminderEmailLink(loaner) || '#'}
                                className={`p-2 rounded-lg transition-colors ${
                                  isOverdue(loaner)
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-orange-600 hover:bg-orange-50'
                                }`}
                                title={isOverdue(loaner) ? 'Send Overdue Notice' : 'Send Reminder'}
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setHistoryLoaner(loaner)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                          {getHistoryCount(loaner.id) > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {getHistoryCount(loaner.id)}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => onEdit(loaner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(loaner.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedRows.has(loaner.id) && (
                    <tr key={`${loaner.id}-details`} className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Device Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Device Details</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">Asset Tag:</span> <span className="text-gray-600 font-mono">{loaner.assetTag}</span></div>
                              <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-600">{loaner.name}</span></div>
                              <div><span className="font-medium text-gray-700">Manufacturer:</span> <span className="text-gray-600">{loaner.manufacturer || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Model:</span> <span className="text-gray-600">{loaner.model || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Serial Number:</span> <span className="text-gray-600 font-mono">{loaner.serialNumber || 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Specs & Condition */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Specs & Condition</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium text-gray-700">Specs:</span> <span className="text-gray-600">{loaner.specs || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{loaner.condition || 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Current Loan Info */}
                          {loaner.status === 'checked-out' && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Current Loan</h4>
                              <div className="space-y-2 text-sm">
                                <div><span className="font-medium text-gray-700">Borrower:</span> <span className="text-gray-600">{loaner.borrowerName || 'N/A'}</span></div>
                                <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{loaner.borrowerEmail || 'N/A'}</span></div>
                                <div><span className="font-medium text-gray-700">Department:</span> <span className="text-gray-600">{loaner.borrowerDepartment || 'N/A'}</span></div>
                                <div><span className="font-medium text-gray-700">Checkout Date:</span> <span className="text-gray-600">{formatDate(loaner.checkoutDate)}</span></div>
                                <div><span className="font-medium text-gray-700">Expected Return:</span> <span className={`${isOverdue(loaner) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{formatDate(loaner.expectedReturnDate)}</span></div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {loaner.notes && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-uva-navy text-sm uppercase tracking-wide border-b pb-2">Notes</h4>
                              <p className="text-sm text-gray-600">{loaner.notes}</p>
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

      {/* History Modal */}
      {historyLoaner && (
        <LoanerHistoryModal
          loaner={historyLoaner}
          history={getLoanerHistory(historyLoaner.id)}
          onClose={() => setHistoryLoaner(null)}
        />
      )}
    </div>
  )
}
