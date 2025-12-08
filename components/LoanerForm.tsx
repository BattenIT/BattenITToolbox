"use client"

import { useState, useEffect, useRef } from 'react'
import {
  LoanerLaptop,
  LoanerStatus,
  STATUS_LABELS,
} from '@/types/loaner'
import { X, Save, Mail, User } from 'lucide-react'
import { loadUsersForAutocomplete, UserAutocompleteData } from '@/utils/dataLoader'

interface LoanerFormProps {
  loaner?: LoanerLaptop | null
  onSave: (loaner: Omit<LoanerLaptop, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void
  onClose: () => void
  mode?: 'add' | 'edit' | 'checkout' | 'return'
}

export default function LoanerForm({ loaner, onSave, onClose, mode = 'add' }: LoanerFormProps) {
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    status: 'available' as LoanerStatus,
    borrowerName: '',
    borrowerEmail: '',
    borrowerDepartment: '',
    checkoutDate: '',
    expectedReturnDate: '',
    specs: '',
    condition: '',
    notes: '',
  })

  // User autocomplete state
  const [users, setUsers] = useState<UserAutocompleteData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserAutocompleteData[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1)
  const userInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load users on mount
  useEffect(() => {
    loadUsersForAutocomplete().then(setUsers)
  }, [])

  useEffect(() => {
    if (loaner) {
      setFormData({
        assetTag: loaner.assetTag,
        name: loaner.name,
        manufacturer: loaner.manufacturer || '',
        model: loaner.model || '',
        serialNumber: loaner.serialNumber || '',
        status: loaner.status,
        borrowerName: loaner.borrowerName || '',
        borrowerEmail: loaner.borrowerEmail || '',
        borrowerDepartment: loaner.borrowerDepartment || '',
        checkoutDate: loaner.checkoutDate ? new Date(loaner.checkoutDate).toISOString().split('T')[0] : '',
        expectedReturnDate: loaner.expectedReturnDate ? new Date(loaner.expectedReturnDate).toISOString().split('T')[0] : '',
        specs: loaner.specs || '',
        condition: loaner.condition || '',
        notes: loaner.notes || '',
      })
    }

    // Pre-fill checkout date for checkout mode
    if (mode === 'checkout') {
      setFormData(prev => ({
        ...prev,
        status: 'checked-out',
        checkoutDate: new Date().toISOString().split('T')[0],
      }))
    }
  }, [loaner, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const loanerData = {
      ...(loaner?.id && { id: loaner.id }),
      assetTag: formData.assetTag,
      name: formData.name,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      serialNumber: formData.serialNumber || undefined,
      status: formData.status,
      borrowerName: formData.borrowerName || undefined,
      borrowerEmail: formData.borrowerEmail || undefined,
      borrowerDepartment: formData.borrowerDepartment || undefined,
      checkoutDate: formData.checkoutDate ? new Date(formData.checkoutDate) : undefined,
      expectedReturnDate: formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : undefined,
      actualReturnDate: mode === 'return' ? new Date() : undefined,
      specs: formData.specs || undefined,
      condition: formData.condition || undefined,
      notes: formData.notes || undefined,
    }

    // Clear borrower info when returning
    if (mode === 'return') {
      loanerData.status = 'available'
      loanerData.borrowerName = undefined
      loanerData.borrowerEmail = undefined
      loanerData.borrowerDepartment = undefined
      loanerData.checkoutDate = undefined
      loanerData.expectedReturnDate = undefined
    }

    onSave(loanerData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle borrower name input with autocomplete
  const handleBorrowerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, borrowerName: value }))
    setSelectedUserIndex(-1)

    if (value.length >= 2 && users.length > 0) {
      const searchLower = value.toLowerCase()
      const matches = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.uid.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      ).slice(0, 10) // Limit to 10 results
      setFilteredUsers(matches)
      setShowUserDropdown(matches.length > 0)
    } else {
      setFilteredUsers([])
      setShowUserDropdown(false)
    }
  }

  // Handle user selection from dropdown
  const selectUser = (user: UserAutocompleteData) => {
    setFormData(prev => ({
      ...prev,
      borrowerName: user.name,
      borrowerEmail: user.email,
    }))
    setShowUserDropdown(false)
    setFilteredUsers([])
  }

  // Handle keyboard navigation in dropdown
  const handleBorrowerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showUserDropdown || filteredUsers.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedUserIndex(prev => Math.min(prev + 1, filteredUsers.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedUserIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedUserIndex >= 0) {
      e.preventDefault()
      selectUser(filteredUsers[selectedUserIndex])
    } else if (e.key === 'Escape') {
      setShowUserDropdown(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        userInputRef.current &&
        !userInputRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTitle = () => {
    switch (mode) {
      case 'checkout':
        return 'Check Out Loaner'
      case 'return':
        return 'Return Loaner'
      case 'edit':
        return 'Edit Loaner Laptop'
      default:
        return 'Add New Loaner Laptop'
    }
  }

  // Generate mailto link for checkout confirmation
  const getCheckoutEmailLink = () => {
    if (!formData.borrowerEmail) return null

    const subject = encodeURIComponent(`Loaner Device Checkout Confirmation - ${formData.name || loaner?.name}`)
    const body = encodeURIComponent(
`Hi ${formData.borrowerName},

This email confirms that you have checked out the following loaner device from Batten IT:

Device: ${formData.name || loaner?.name}
Asset Tag: ${formData.assetTag || loaner?.assetTag}
${formData.manufacturer ? `Manufacturer: ${formData.manufacturer}` : ''}
${formData.model ? `Model: ${formData.model}` : ''}
${formData.serialNumber ? `Serial Number: ${formData.serialNumber}` : ''}

Checkout Date: ${formData.checkoutDate ? new Date(formData.checkoutDate).toLocaleDateString() : 'Today'}
Expected Return Date: ${formData.expectedReturnDate ? new Date(formData.expectedReturnDate).toLocaleDateString() : 'TBD'}

Please return the device by the expected return date. If you need to extend your loan period, contact Batten IT.

Questions? Contact battensupport@virginia.edu or call (434) 924-0812.

Thank you,
Batten IT
`)
    return `mailto:${formData.borrowerEmail}?subject=${subject}&body=${body}`
  }

  // Generate mailto link for return reminder
  const getReminderEmailLink = () => {
    if (!loaner?.borrowerEmail) return null

    const subject = encodeURIComponent(`Reminder: Loaner Device Return - ${loaner.name}`)
    const body = encodeURIComponent(
`Hi ${loaner.borrowerName},

This is a friendly reminder that your loaner device is due for return.

Device: ${loaner.name}
Asset Tag: ${loaner.assetTag}
Expected Return Date: ${loaner.expectedReturnDate ? new Date(loaner.expectedReturnDate).toLocaleDateString() : 'As soon as possible'}

Please return the device to Batten IT at your earliest convenience.

If you need to extend your loan period, please reply to this email or contact us.

Thank you,
Batten IT
battensupport@virginia.edu | (434) 924-0812
`)
    return `mailto:${loaner.borrowerEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-uva-navy">
            {getTitle()}
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
          {/* Device Information - Always show for add/edit, hide for checkout/return */}
          {(mode === 'add' || mode === 'edit') && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Tag <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="assetTag"
                      value={formData.assetTag}
                      onChange={handleChange}
                      required
                      placeholder="e.g., LOANER-001"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono
                               focus:outline-none focus:border-uva-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Dell Latitude 5520"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:border-uva-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="e.g., Dell, Lenovo, HP"
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
                      placeholder="e.g., Latitude 5520"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:border-uva-orange transition-colors"
                    />
                  </div>

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
                </div>
              </div>

              {/* Specs & Condition */}
              <div>
                <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Specs & Condition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specs</label>
                    <input
                      type="text"
                      name="specs"
                      value={formData.specs}
                      onChange={handleChange}
                      placeholder="e.g., i5, 16GB RAM, 256GB SSD"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:border-uva-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:border-uva-orange transition-colors bg-white"
                    >
                      <option value="">Select condition...</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Borrower Information - Show for checkout mode or when editing checked-out device */}
          {(mode === 'checkout' || (mode === 'edit' && formData.status === 'checked-out')) && (
            <div>
              <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Borrower Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrower Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={userInputRef}
                      type="text"
                      name="borrowerName"
                      value={formData.borrowerName}
                      onChange={handleBorrowerNameChange}
                      onKeyDown={handleBorrowerKeyDown}
                      onFocus={() => {
                        if (formData.borrowerName.length >= 2 && filteredUsers.length > 0) {
                          setShowUserDropdown(true)
                        }
                      }}
                      required={mode === 'checkout'}
                      placeholder="Start typing name..."
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:border-uva-orange transition-colors"
                    />
                  </div>
                  {/* User autocomplete dropdown */}
                  {showUserDropdown && filteredUsers.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {filteredUsers.map((user, index) => (
                        <button
                          key={user.uid}
                          type="button"
                          onClick={() => selectUser(user)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-uva-orange/10 transition-colors ${
                            index === selectedUserIndex ? 'bg-uva-orange/20' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {users.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {users.length} users available for lookup
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Email</label>
                  <input
                    type="email"
                    name="borrowerEmail"
                    value={formData.borrowerEmail}
                    onChange={handleChange}
                    placeholder="e.g., js1abc@virginia.edu"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-uva-orange transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="borrowerDepartment"
                    value={formData.borrowerDepartment}
                    onChange={handleChange}
                    placeholder="e.g., Public Policy"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-uva-orange transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Checkout Date</label>
                  <input
                    type="date"
                    name="checkoutDate"
                    value={formData.checkoutDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-uva-orange transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    name="expectedReturnDate"
                    value={formData.expectedReturnDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-uva-orange transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Return confirmation */}
          {mode === 'return' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Confirm Return</h3>
              <p className="text-sm text-blue-800 mb-4">
                You are returning <strong>{loaner?.name}</strong> (Asset Tag: {loaner?.assetTag})
                from <strong>{loaner?.borrowerName}</strong>.
              </p>
              <p className="text-sm text-blue-800">
                The device will be marked as Available and borrower information will be cleared.
              </p>
            </div>
          )}

          {/* Notes - Always show */}
          <div>
            <h3 className="text-lg font-semibold text-uva-navy mb-4 border-b pb-2">Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-uva-orange transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t">
            {/* Email button - show for checkout when email is provided */}
            <div>
              {mode === 'checkout' && formData.borrowerEmail && (
                <a
                  href={getCheckoutEmailLink() || '#'}
                  className="px-4 py-2 border-2 border-purple-300 bg-purple-50 rounded-lg font-semibold
                           text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-2"
                  title="Opens your email client with a pre-filled checkout confirmation"
                >
                  <Mail className="w-4 h-4" />
                  Email Confirmation
                </a>
              )}
              {mode === 'return' && loaner?.borrowerEmail && (
                <a
                  href={getReminderEmailLink() || '#'}
                  className="px-4 py-2 border-2 border-purple-300 bg-purple-50 rounded-lg font-semibold
                           text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-2"
                  title="Opens your email client with a pre-filled return thank you"
                >
                  <Mail className="w-4 h-4" />
                  Email Thank You
                </a>
              )}
            </div>

            <div className="flex gap-3">
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
                className={`px-6 py-2 text-white rounded-lg font-semibold
                         transition-colors flex items-center gap-2 ${
                           mode === 'return'
                             ? 'bg-blue-600 hover:bg-blue-700'
                             : mode === 'checkout'
                             ? 'bg-green-600 hover:bg-green-700'
                             : 'bg-uva-orange hover:bg-uva-orange-light'
                         }`}
              >
                <Save className="w-4 h-4" />
                {mode === 'return' ? 'Confirm Return' : mode === 'checkout' ? 'Check Out' : loaner ? 'Save Changes' : 'Add Loaner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
