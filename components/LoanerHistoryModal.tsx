"use client"

import { X, Calendar, User, Clock, Mail, Building2, FileText } from 'lucide-react'
import { LoanHistory, LoanerLaptop } from '@/types/loaner'

interface LoanerHistoryModalProps {
  loaner: LoanerLaptop
  history: LoanHistory[]
  onClose: () => void
}

export default function LoanerHistoryModal({
  loaner,
  history,
  onClose
}: LoanerHistoryModalProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateWithTime = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLoanDuration = (checkout: Date, returnDate?: Date) => {
    const end = returnDate ? new Date(returnDate) : new Date()
    const start = new Date(checkout)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Same day'
    if (days === 1) return '1 day'
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`
  }

  const isOverdue = (expectedReturn?: Date, actualReturn?: Date) => {
    if (!expectedReturn) return false
    const returnDate = actualReturn ? new Date(actualReturn) : new Date()
    return returnDate > new Date(expectedReturn)
  }

  // Sort history by checkout date descending (most recent first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime()
  )

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-uva-navy p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-serif font-bold">Loan History</h2>
              <p className="text-white/80 mt-1">
                {loaner.name} ({loaner.assetTag})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{sortedHistory.length}</p>
              <p className="text-sm text-white/70">Total Loans</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {sortedHistory.filter(h => h.actualReturnDate).length}
              </p>
              <p className="text-sm text-white/70">Completed</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {sortedHistory.filter(h => !h.actualReturnDate).length}
              </p>
              <p className="text-sm text-white/70">Active</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No loan history yet</p>
              <p className="text-gray-400 text-sm mt-1">
                History will appear here when devices are checked out and returned.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((entry, index) => {
                const wasOverdue = isOverdue(entry.expectedReturnDate, entry.actualReturnDate)
                const isActive = !entry.actualReturnDate

                return (
                  <div
                    key={entry.id}
                    className={`border-2 rounded-xl p-4 ${
                      isActive
                        ? 'border-yellow-300 bg-yellow-50'
                        : wasOverdue
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-yellow-200 text-yellow-800'
                          : wasOverdue
                            ? 'bg-red-200 text-red-800'
                            : 'bg-green-200 text-green-800'
                      }`}>
                        {isActive ? 'Currently Checked Out' : wasOverdue ? 'Returned Late' : 'Returned On Time'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Loan #{sortedHistory.length - index}
                      </span>
                    </div>

                    {/* Borrower Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-uva-navy/10 text-uva-navy">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-uva-navy">{entry.borrowerName}</p>
                        {entry.borrowerEmail && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{entry.borrowerEmail}</span>
                          </div>
                        )}
                        {entry.borrowerDepartment && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Building2 className="w-3 h-3" />
                            <span>{entry.borrowerDepartment}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-gray-500 text-xs">Checked Out</p>
                        <p className="font-medium text-gray-800">{formatDate(entry.checkoutDate)}</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-gray-500 text-xs">Expected Return</p>
                        <p className={`font-medium ${
                          isActive && isOverdue(entry.expectedReturnDate)
                            ? 'text-red-600'
                            : 'text-gray-800'
                        }`}>
                          {formatDate(entry.expectedReturnDate)}
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-gray-500 text-xs">Actual Return</p>
                        <p className={`font-medium ${
                          wasOverdue ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {formatDate(entry.actualReturnDate)}
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-gray-500 text-xs">Duration</p>
                        <p className="font-medium text-gray-800">
                          {getLoanDuration(entry.checkoutDate, entry.actualReturnDate)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-uva-navy text-white rounded-lg font-semibold
                     hover:bg-uva-navy/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
