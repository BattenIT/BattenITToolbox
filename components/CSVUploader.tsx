"use client"

import { useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

type CSVType = 'jamf' | 'intune' | 'users' | 'coreview' | 'qualys'

interface CSVUploaderProps {
  onUpload: (type: CSVType, file: File) => Promise<void>
  onClose: () => void
}

export default function CSVUploader({ onUpload, onClose }: CSVUploaderProps) {
  const [jamfFile, setJamfFile] = useState<File | null>(null)
  const [intuneFile, setIntuneFile] = useState<File | null>(null)
  const [usersFile, setUsersFile] = useState<File | null>(null)
  const [coreviewFile, setCoreviewFile] = useState<File | null>(null)
  const [qualysFile, setQualysFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    jamf?: 'success' | 'error'
    intune?: 'success' | 'error'
    users?: 'success' | 'error'
    coreview?: 'success' | 'error'
    qualys?: 'success' | 'error'
  }>({})

  const handleFileSelect = (type: CSVType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === 'jamf') setJamfFile(file)
      else if (type === 'intune') setIntuneFile(file)
      else if (type === 'users') setUsersFile(file)
      else if (type === 'coreview') setCoreviewFile(file)
      else if (type === 'qualys') setQualysFile(file)
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    setUploadStatus({})

    try {
      // Upload Jamf file
      if (jamfFile) {
        try {
          await onUpload('jamf', jamfFile)
          setUploadStatus(prev => ({ ...prev, jamf: 'success' }))
        } catch (error) {
          setUploadStatus(prev => ({ ...prev, jamf: 'error' }))
        }
      }

      // Upload Intune file
      if (intuneFile) {
        try {
          await onUpload('intune', intuneFile)
          setUploadStatus(prev => ({ ...prev, intune: 'success' }))
        } catch (error) {
          setUploadStatus(prev => ({ ...prev, intune: 'error' }))
        }
      }

      // Upload Users file
      if (usersFile) {
        try {
          await onUpload('users', usersFile)
          setUploadStatus(prev => ({ ...prev, users: 'success' }))
        } catch (error) {
          setUploadStatus(prev => ({ ...prev, users: 'error' }))
        }
      }

      // Upload CoreView file
      if (coreviewFile) {
        try {
          await onUpload('coreview', coreviewFile)
          setUploadStatus(prev => ({ ...prev, coreview: 'success' }))
        } catch (error) {
          setUploadStatus(prev => ({ ...prev, coreview: 'error' }))
        }
      }

      // Upload Qualys file
      if (qualysFile) {
        try {
          await onUpload('qualys', qualysFile)
          setUploadStatus(prev => ({ ...prev, qualys: 'success' }))
        } catch (error) {
          setUploadStatus(prev => ({ ...prev, qualys: 'error' }))
        }
      }

      // Wait a moment to show success status
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Close if all uploads were successful
      const allSuccess = Object.values(uploadStatus).every(status => status === 'success')
      if (allSuccess) {
        onClose()
      }
    } finally {
      setUploading(false)
    }
  }

  const renderFileStatus = (file: File | null, status?: 'success' | 'error') => {
    if (!file) return null

    return (
      <div className="flex items-center gap-2 mt-2 text-sm">
        {status === 'success' && (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700">{file.name} - Uploaded successfully</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700">{file.name} - Upload failed</span>
          </>
        )}
        {!status && (
          <span className="text-gray-600">{file.name}</span>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-uva-orange" />
            <h2 className="text-2xl font-serif font-bold text-uva-navy">Upload CSV Files</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Upload CSV files to update the dashboard. All files are optional - only upload the ones you want to update.
          </p>

          {/* Jamf Upload */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-uva-navy">Jamf Pro (macOS Devices)</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('jamf', e)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-uva-navy file:text-white
                         hover:file:bg-uva-blue-light
                         file:cursor-pointer cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {renderFileStatus(jamfFile, uploadStatus.jamf)}
            </label>
          </div>

          {/* Intune Upload */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-uva-navy">Microsoft Intune (Windows Devices)</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('intune', e)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-uva-navy file:text-white
                         hover:file:bg-uva-blue-light
                         file:cursor-pointer cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {renderFileStatus(intuneFile, uploadStatus.intune)}
            </label>
          </div>

          {/* Users Directory Upload */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-uva-navy">Batten User Directory</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('users', e)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-uva-navy file:text-white
                         hover:file:bg-uva-blue-light
                         file:cursor-pointer cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {renderFileStatus(usersFile, uploadStatus.users)}
            </label>
          </div>

          {/* CoreView Upload */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-uva-navy">CoreView (Microsoft 365 Data)</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('coreview', e)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-uva-navy file:text-white
                         hover:file:bg-uva-blue-light
                         file:cursor-pointer cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {renderFileStatus(coreviewFile, uploadStatus.coreview)}
            </label>
          </div>

          {/* Qualys Upload */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-uva-navy">Qualys (Vulnerability & Asset Data)</span>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('qualys', e)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-uva-navy file:text-white
                         hover:file:bg-uva-blue-light
                         file:cursor-pointer cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {renderFileStatus(qualysFile, uploadStatus.qualys)}
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">CSV File Requirements</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Jamf: Export from Jamf Pro with all device fields</li>
              <li>Intune: Export device list from Microsoft Endpoint Manager</li>
              <li>Users: Batten directory export with computing IDs</li>
              <li>CoreView: Export Microsoft 365 usage and compliance data</li>
              <li>Qualys: Export QualysAssets.csv from Microsoft Fabric</li>
              <li>Files will be stored locally in your browser</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold
                     hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || (!jamfFile && !intuneFile && !usersFile && !coreviewFile && !qualysFile)}
            className="px-6 py-2 bg-uva-navy text-white rounded-lg font-semibold
                     hover:bg-uva-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Files
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
