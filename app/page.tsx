"use client"

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MetricCard from '@/components/MetricCard'
import DeviceTable from '@/components/DeviceTable'
import { AlertCircle, AlertTriangle, CheckCircle, Laptop, Shield, Clock, Database, Search, User, DollarSign, TrendingUp, Upload, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Device } from '@/types/device'
import { MetricCardData } from '@/types/metric'
import { loadDeviceData, calculateDeviceSummary, saveCSVToStorage } from '@/utils/dataLoader'
import CSVUploader from '@/components/CSVUploader'

type FilterView = 'attention' | 'all' | 'critical' | 'warning' | 'good' | 'inactive' | 'active' | 'jamf' | 'intune' | 'replacement'

export default function Home() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [filterView, setFilterView] = useState<FilterView>('attention')
  const [searchTerm, setSearchTerm] = useState('')
  const [userLookup, setUserLookup] = useState('')
  const [showBudgetTool, setShowBudgetTool] = useState(false)
  const [showCSVUploader, setShowCSVUploader] = useState(false)
  const [devicesPerPage, setDevicesPerPage] = useState<number>(25)

  // Load device data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const deviceData = await loadDeviceData()
      setDevices(deviceData)
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async (type: 'jamf' | 'intune' | 'users' | 'coreview' | 'qualys', file: File) => {
    const text = await file.text()
    saveCSVToStorage(type, text)
    console.log(`Uploaded ${type} CSV: ${file.name}`)
  }

  const handleCSVUploadComplete = () => {
    setShowCSVUploader(false)
    // Reload data with new CSVs
    loadData()
  }

  // Calculate summary metrics
  const summary = calculateDeviceSummary(devices)

  // Filter devices based on selected view
  const getFilteredDevices = (): Device[] => {
    let filtered: Device[] = []

    switch (filterView) {
      case 'all':
        filtered = devices
        break
      case 'critical':
        filtered = devices.filter(d => d.status === 'critical')
        break
      case 'warning':
        filtered = devices.filter(d => d.status === 'warning')
        break
      case 'good':
        filtered = devices.filter(d => d.status === 'good')
        break
      case 'inactive':
        filtered = devices.filter(d => d.status === 'inactive')
        break
      case 'active':
        filtered = devices.filter(d => d.activityStatus === 'active')
        break
      case 'jamf':
        filtered = devices.filter(d => d.source === 'jamf')
        break
      case 'intune':
        filtered = devices.filter(d => d.source === 'intune')
        break
      case 'replacement':
        filtered = devices.filter(d => d.replacementRecommended)
        break
      case 'attention':
      default:
        filtered = devices.filter(d => d.status === 'critical' || d.status === 'warning' || d.status === 'inactive')
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.owner.toLowerCase().includes(search) ||
        d.ownerEmail?.toLowerCase().includes(search) ||
        d.additionalOwner?.toLowerCase().includes(search) ||
        d.serialNumber?.toLowerCase().includes(search) ||
        d.department?.toLowerCase().includes(search) ||
        d.model.toLowerCase().includes(search)
      )
    }

    // Apply user lookup filter
    if (userLookup.trim()) {
      const lookup = userLookup.toLowerCase()
      filtered = filtered.filter(d =>
        d.owner.toLowerCase().includes(lookup) ||
        d.ownerEmail?.toLowerCase().includes(lookup) ||
        d.additionalOwner?.toLowerCase().includes(lookup)
      )
    }

    return filtered
  }

  const filteredDevices = getFilteredDevices()

  // Paginate devices
  const displayedDevices = devicesPerPage === -1
    ? filteredDevices
    : filteredDevices.slice(0, devicesPerPage)

  // Get filter title and description
  const getFilterInfo = () => {
    switch (filterView) {
      case 'all':
        return { title: 'All Devices', description: 'Complete device inventory' }
      case 'critical':
        return { title: 'Critical Devices', description: 'Devices requiring immediate replacement' }
      case 'warning':
        return { title: 'Warning Devices', description: 'Devices approaching end-of-life' }
      case 'good':
        return { title: 'Good Devices', description: 'Devices in good condition' }
      case 'inactive':
        return { title: 'Inactive Devices', description: 'Not checked in for 30+ days' }
      case 'active':
        return { title: 'Active Devices', description: 'Checked in within 30 days' }
      case 'jamf':
        return { title: 'Jamf Devices', description: 'macOS devices from Jamf' }
      case 'intune':
        return { title: 'Intune Devices', description: 'Windows devices from Intune' }
      case 'replacement':
        return { title: 'Replacement Needed', description: 'Devices flagged for replacement' }
      case 'attention':
      default:
        return { title: 'Devices Needing Attention', description: 'Critical, Warning, and Inactive devices' }
    }
  }

  const filterInfo = getFilterInfo()

  // Metric cards data
  const metricCards: MetricCardData[] = [
    {
      label: 'Critical',
      value: summary.criticalCount,
      subtext: 'Devices need replacement',
      icon: AlertCircle,
      bgColor: 'bg-white',
      borderColor: 'border-red-200',
      iconGradient: 'from-red-500 to-red-600',
    },
    {
      label: 'Warning',
      value: summary.warningCount,
      subtext: 'Devices approaching EOL',
      icon: AlertTriangle,
      bgColor: 'bg-white',
      borderColor: 'border-yellow-200',
      iconGradient: 'from-uva-orange to-uva-orange-light',
    },
    {
      label: 'Good',
      value: summary.goodCount,
      subtext: 'Devices up to date',
      icon: CheckCircle,
      bgColor: 'bg-white',
      borderColor: 'border-green-200',
      iconGradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Inactive',
      value: summary.inactiveCount,
      subtext: 'Not checked in 30+ days',
      icon: Clock,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      iconGradient: 'from-gray-500 to-gray-600',
    },
  ]

  const additionalMetrics: MetricCardData[] = [
    {
      label: 'Total Devices',
      value: summary.totalDevices,
      subtext: 'Across all platforms',
      icon: Laptop,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      iconGradient: 'from-uva-navy to-uva-navy/80',
    },
    {
      label: 'Need Replacement',
      value: summary.devicesNeedingReplacement,
      subtext: 'Hardware aging or obsolete',
      icon: AlertCircle,
      bgColor: 'bg-white',
      borderColor: 'border-red-200',
      iconGradient: 'from-red-500 to-red-600',
    },
    {
      label: 'Out of Date',
      value: summary.outOfDateDevices,
      subtext: 'Not updated in 30+ days',
      icon: Clock,
      bgColor: 'bg-white',
      borderColor: 'border-yellow-200',
      iconGradient: 'from-yellow-500 to-yellow-600',
    },
    {
      label: 'Data Sources',
      value: 2,
      subtext: 'Jamf & Intune',
      icon: Database,
      bgColor: 'bg-white',
      borderColor: 'border-blue-200',
      iconGradient: 'from-blue-500 to-blue-600',
    },
  ]

  // Security metrics (Qualys)
  const securityMetrics: MetricCardData[] = summary.devicesWithQualysData && summary.devicesWithQualysData > 0 ? [
    {
      label: 'Qualys Coverage',
      value: `${summary.devicesWithQualysData}/${summary.totalDevices}`,
      subtext: `${((summary.devicesWithQualysData / summary.totalDevices) * 100).toFixed(1)}% of devices`,
      icon: Shield,
      bgColor: 'bg-white',
      borderColor: 'border-green-200',
      iconGradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Vulnerabilities',
      value: summary.totalVulnerabilities || 0,
      subtext: 'Total across fleet',
      icon: AlertTriangle,
      bgColor: 'bg-white',
      borderColor: 'border-red-200',
      iconGradient: 'from-red-500 to-red-600',
    },
    {
      label: 'Critical Vulns',
      value: summary.criticalVulnerabilities || 0,
      subtext: 'Severity 4-5',
      icon: AlertCircle,
      bgColor: 'bg-white',
      borderColor: 'border-orange-200',
      iconGradient: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Avg TruRisk',
      value: summary.averageTruRiskScore || 'N/A',
      subtext: 'Out of 1000',
      icon: TrendingUp,
      bgColor: 'bg-white',
      borderColor: 'border-blue-200',
      iconGradient: 'from-blue-500 to-blue-600',
    },
  ] : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Main Content */}
        <section className="max-w-[1920px] mx-auto px-8 py-12 pt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block w-16 h-16 border-4 border-uva-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-gray-600">Loading device data...</p>
              </div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-gray-700 mb-2">
                No Data Available
              </h2>
              <p className="text-gray-600">
                Unable to load device data. Please check that CSV files are available.
              </p>
            </div>
          ) : (
            <>
              {/* Search and Tools */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  Search & Tools
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Search Bar */}
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-uva-orange" />
                      <h3 className="text-lg font-semibold text-uva-navy">Search Devices</h3>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, owner, serial, model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-uva-orange focus:outline-none transition-colors"
                    />
                    {searchTerm && (
                      <div className="mt-3 text-sm text-gray-600">
                        Found {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-2 text-uva-orange hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Lookup Tool */}
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-uva-orange" />
                      <h3 className="text-lg font-semibold text-uva-navy">User Lookup</h3>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter name or computing ID..."
                      value={userLookup}
                      onChange={(e) => setUserLookup(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-uva-orange focus:outline-none transition-colors"
                    />
                    {userLookup && (
                      <div className="mt-3 text-sm text-gray-600">
                        {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} for this user
                        <button
                          onClick={() => setUserLookup('')}
                          className="ml-2 text-uva-orange hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Analytics Tool */}
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-uva-orange" />
                      <h3 className="text-lg font-semibold text-uva-navy">Analytics</h3>
                    </div>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="w-full px-4 py-2 bg-uva-navy text-white rounded-lg hover:bg-uva-blue-light transition-colors font-semibold"
                    >
                      View Charts & Insights
                    </button>
                    <p className="mt-3 text-sm text-gray-600">
                      Detailed visualizations
                    </p>
                  </div>

                  {/* Budget Tool Toggle */}
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-uva-orange" />
                      <h3 className="text-lg font-semibold text-uva-navy">Budget Planning</h3>
                    </div>
                    <button
                      onClick={() => setShowBudgetTool(!showBudgetTool)}
                      className="w-full px-4 py-2 bg-uva-navy text-white rounded-lg hover:bg-uva-blue-light transition-colors font-semibold"
                    >
                      {showBudgetTool ? 'Hide' : 'Show'} Budget Calculator
                    </button>
                    <p className="mt-3 text-sm text-gray-600">
                      Estimate replacement costs
                    </p>
                  </div>

                  {/* CSV Upload Tool */}
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Upload className="w-5 h-5 text-uva-orange" />
                      <h3 className="text-lg font-semibold text-uva-navy">Upload CSVs</h3>
                    </div>
                    <button
                      onClick={() => setShowCSVUploader(true)}
                      className="w-full px-4 py-2 bg-uva-navy text-white rounded-lg hover:bg-uva-blue-light transition-colors font-semibold"
                    >
                      Upload Data Files
                    </button>
                    <p className="mt-3 text-sm text-gray-600">
                      Update Jamf, Intune, or Users
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Metrics */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  Device Health Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metricCards.map((card, index) => (
                    <MetricCard
                      key={card.label}
                      data={card}
                      animationDelay={`animation-delay-${index * 200}`}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  Additional Insights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {additionalMetrics.map((card, index) => (
                    <MetricCard
                      key={card.label}
                      data={card}
                      animationDelay={`animation-delay-${index * 200}`}
                    />
                  ))}
                </div>
              </div>

              {/* Security Metrics (Qualys) */}
              {securityMetrics.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-7 h-7 text-red-600" />
                    <h2 className="text-2xl font-serif font-bold text-uva-navy">
                      Security & Vulnerability Insights
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {securityMetrics.map((card, index) => (
                      <MetricCard
                        key={card.label}
                        data={card}
                        animationDelay={`animation-delay-${index * 200}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Planning Tool */}
              {showBudgetTool && (
                <div className="mb-12 animate-fade-in">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-2xl border-4 border-green-200 p-8">
                    <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6 flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      Replacement Budget Calculator
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Critical Devices */}
                      <div className="bg-white rounded-lg p-6 shadow-2xl border-2 border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Critical Replacements</h3>
                        <p className="text-3xl font-serif font-bold text-red-600 mb-1">
                          {summary.criticalCount}
                        </p>
                        <p className="text-sm text-gray-500">devices @ $1,500 avg</p>
                        <p className="text-2xl font-semibold text-uva-navy mt-3">
                          ${(summary.criticalCount * 1500).toLocaleString()}
                        </p>
                      </div>

                      {/* Warning Devices */}
                      <div className="bg-white rounded-lg p-6 shadow-2xl border-2 border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Warning (Next FY)</h3>
                        <p className="text-3xl font-serif font-bold text-yellow-600 mb-1">
                          {summary.warningCount}
                        </p>
                        <p className="text-sm text-gray-500">devices @ $1,500 avg</p>
                        <p className="text-2xl font-semibold text-uva-navy mt-3">
                          ${(summary.warningCount * 1500).toLocaleString()}
                        </p>
                      </div>

                      {/* Total Flagged */}
                      <div className="bg-white rounded-lg p-6 shadow-2xl border-2 border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Flagged</h3>
                        <p className="text-3xl font-serif font-bold text-uva-orange mb-1">
                          {summary.devicesNeedingReplacement}
                        </p>
                        <p className="text-sm text-gray-500">devices @ $1,500 avg</p>
                        <p className="text-2xl font-semibold text-uva-navy mt-3">
                          ${(summary.devicesNeedingReplacement * 1500).toLocaleString()}
                        </p>
                      </div>

                      {/* 2-Year Projection */}
                      <div className="bg-white rounded-lg p-6 shadow-2xl border-4 border-green-300">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">2-Year Total Need</h3>
                        <p className="text-3xl font-serif font-bold text-green-600 mb-1">
                          {summary.criticalCount + summary.warningCount}
                        </p>
                        <p className="text-sm text-gray-500">devices over 2 years</p>
                        <p className="text-2xl font-semibold text-uva-navy mt-3">
                          ${((summary.criticalCount + summary.warningCount) * 1500).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-xl border-2 border-gray-100">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Costs estimated at $1,500 per device (average of MacBook Air $1,200 and MacBook Pro $1,800).
                        Critical devices need immediate replacement. Warning devices should be budgeted for next fiscal year.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Classification Criteria */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  How Devices Are Classified
                </h2>
                <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Status Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-uva-navy mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-uva-orange" />
                        Device Status Categories
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-6 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                            <span className="text-red-700 font-semibold text-xs">Critical</span>
                          </div>
                          <p className="text-gray-600">
                            Device is <strong>3+ years old</strong> or running unsupported OS. Eligible for immediate replacement under Batten IT policy.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-6 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-center">
                            <span className="text-yellow-700 font-semibold text-xs">Warning</span>
                          </div>
                          <p className="text-gray-600">
                            Device is <strong>2-3 years old</strong> or running aging OS. Should be budgeted for replacement in next fiscal year.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-6 bg-green-50 border border-green-200 rounded flex items-center justify-center">
                            <span className="text-green-700 font-semibold text-xs">Good</span>
                          </div>
                          <p className="text-gray-600">
                            Device is <strong>less than 2 years old</strong> and actively checking in. Within healthy lifecycle.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-20 h-6 bg-gray-50 border border-gray-300 rounded flex items-center justify-center">
                            <span className="text-gray-700 font-semibold text-xs">Inactive</span>
                          </div>
                          <p className="text-gray-600">
                            Device has <strong>not checked in for 30+ days</strong>. May be lost, stolen, decommissioned, or user has left organization.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Criteria */}
                    <div>
                      <h3 className="text-lg font-semibold text-uva-navy mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-uva-orange" />
                        Additional Criteria
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <p className="font-semibold text-uva-navy mb-1">Activity Status</p>
                          <p>Active devices have checked in within <strong>30 days</strong>. Inactive devices exceed this threshold.</p>
                        </div>
                        <div>
                          <p className="font-semibold text-uva-navy mb-1">Replacement Policy</p>
                          <p>Batten IT follows a <strong>3-year replacement cycle</strong>. Devices 3-5 years old are flagged for replacement. Devices older than 5 years are excluded as they're likely retired machines still in use.</p>
                        </div>
                        <div>
                          <p className="font-semibold text-uva-navy mb-1">Owner Matching</p>
                          <p>Primary owners are automatically matched from device names (e.g., FBS-<strong>computingID</strong>-MBA-2023) against the Batten directory. IT provisioners are labeled accordingly.</p>
                        </div>
                        <div>
                          <p className="font-semibold text-uva-navy mb-1">Data Sources</p>
                          <p><strong>Jamf</strong> manages macOS devices. <strong>Intune</strong> manages Windows devices. Data is refreshed from CSV exports.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-4">
                  Device List
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setFilterView('attention')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'attention'
                        ? 'bg-uva-orange text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-uva-orange'
                    }`}
                  >
                    Needs Attention ({summary.criticalCount + summary.warningCount + summary.inactiveCount})
                  </button>
                  <button
                    onClick={() => setFilterView('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'all'
                        ? 'bg-uva-orange text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-uva-orange'
                    }`}
                  >
                    All Devices ({summary.totalDevices})
                  </button>
                  <button
                    onClick={() => setFilterView('critical')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'critical'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-600'
                    }`}
                  >
                    Critical ({summary.criticalCount})
                  </button>
                  <button
                    onClick={() => setFilterView('warning')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'warning'
                        ? 'bg-yellow-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-600'
                    }`}
                  >
                    Warning ({summary.warningCount})
                  </button>
                  <button
                    onClick={() => setFilterView('good')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'good'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-600'
                    }`}
                  >
                    Good ({summary.goodCount})
                  </button>
                  <button
                    onClick={() => setFilterView('inactive')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'inactive'
                        ? 'bg-gray-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-600'
                    }`}
                  >
                    Inactive ({summary.inactiveCount})
                  </button>
                  <button
                    onClick={() => setFilterView('active')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'active'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600'
                    }`}
                  >
                    Active ({summary.activeDevices})
                  </button>
                  <button
                    onClick={() => setFilterView('jamf')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'jamf'
                        ? 'bg-uva-navy text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-uva-navy'
                    }`}
                  >
                    Jamf ({devices.filter(d => d.source === 'jamf').length})
                  </button>
                  <button
                    onClick={() => setFilterView('intune')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'intune'
                        ? 'bg-uva-navy text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-uva-navy'
                    }`}
                  >
                    Intune ({devices.filter(d => d.source === 'intune').length})
                  </button>
                  <button
                    onClick={() => setFilterView('replacement')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterView === 'replacement'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-600'
                    }`}
                  >
                    Replacement ({summary.devicesNeedingReplacement})
                  </button>
                </div>
                <p className="text-sm text-gray-600 italic">{filterInfo.description}</p>
              </div>

              {/* Device Table - Show filtered devices */}
              <div className="mb-12 animate-fade-in">
                {/* Pagination Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Showing {displayedDevices.length} of {filteredDevices.length} devices
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="devicesPerPage" className="text-sm text-gray-600">
                      Show:
                    </label>
                    <select
                      id="devicesPerPage"
                      value={devicesPerPage}
                      onChange={(e) => setDevicesPerPage(Number(e.target.value))}
                      className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-semibold
                               focus:border-uva-orange focus:outline-none transition-colors bg-white"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={-1}>All</option>
                    </select>
                  </div>
                </div>

                <DeviceTable
                  devices={displayedDevices}
                  title={filterInfo.title}
                  showExport={true}
                />
              </div>

              {/* Statistics Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  Device Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Average Device Age</h3>
                    <p className="text-4xl font-serif font-bold text-uva-navy">
                      {summary.averageAge.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">years</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Devices</h3>
                    <p className="text-4xl font-serif font-bold text-uva-navy">
                      {summary.activeDevices}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">checked in recently</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">macOS Devices</h3>
                    <p className="text-4xl font-serif font-bold text-uva-navy">
                      {devices.filter(d => d.source === 'jamf').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">from Jamf</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Windows Devices</h3>
                    <p className="text-4xl font-serif font-bold text-uva-navy">
                      {devices.filter(d => d.source === 'intune').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">from Intune</p>
                  </div>
                </div>
              </div>

              {/* Device Replacement Timeline */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-uva-orange" />
                  Replacement Timeline & Forecast
                </h2>
                <div className="bg-white rounded-xl shadow-2xl border-4 border-gray-100 p-8">
                  <div className="space-y-6">
                    {/* Current Year */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-red-600">FY 2025 (Immediate)</h3>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          {summary.criticalCount} devices
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-8 rounded-full flex items-center justify-end pr-4 transition-all duration-1000"
                          style={{ width: `${Math.min((summary.criticalCount / summary.totalDevices) * 100, 100)}%` }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {((summary.criticalCount / summary.totalDevices) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Critical devices (3+ years old) requiring immediate replacement
                      </p>
                    </div>

                    {/* Next Year */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-yellow-600">FY 2026 (Next Year)</h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          {summary.warningCount} devices
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-8 rounded-full flex items-center justify-end pr-4 transition-all duration-1000"
                          style={{ width: `${Math.min((summary.warningCount / summary.totalDevices) * 100, 100)}%` }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {((summary.warningCount / summary.totalDevices) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Warning devices (2-3 years old) approaching replacement cycle
                      </p>
                    </div>

                    {/* Future Years */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-600">FY 2027+ (Future)</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {summary.goodCount} devices
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-4 transition-all duration-1000"
                          style={{ width: `${Math.min((summary.goodCount / summary.totalDevices) * 100, 100)}%` }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {((summary.goodCount / summary.totalDevices) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Good devices (less than 2 years old) within healthy lifecycle
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Average Device Age</p>
                          <p className="text-3xl font-serif font-bold text-uva-navy">{summary.averageAge.toFixed(1)} <span className="text-lg">years</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">2-Year Replacement Need</p>
                          <p className="text-3xl font-serif font-bold text-uva-orange">{summary.criticalCount + summary.warningCount} <span className="text-lg">devices</span></p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Fleet Health Score</p>
                          <p className="text-3xl font-serif font-bold text-green-600">
                            {((summary.goodCount / summary.totalDevices) * 100).toFixed(0)}
                            <span className="text-lg">%</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-uva-navy mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="bg-white rounded-xl shadow-2xl border-4 border-gray-100
                                   p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-uva-orange
                                   hover:-translate-y-2 transition-all duration-300
                                   text-left group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-uva-navy to-uva-navy/80
                                    rounded-xl group-hover:from-uva-orange
                                    group-hover:to-uva-orange-light transition-all">
                        <Laptop className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-bold text-uva-navy">
                          All Devices
                        </p>
                        <p className="text-sm text-gray-600">View inventory</p>
                      </div>
                    </div>
                  </button>

                  <button className="bg-white rounded-xl shadow-2xl border-4 border-gray-100
                                   p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-uva-orange
                                   hover:-translate-y-2 transition-all duration-300
                                   text-left group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-uva-navy to-uva-navy/80
                                    rounded-xl group-hover:from-uva-orange
                                    group-hover:to-uva-orange-light transition-all">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-bold text-uva-navy">
                          Security
                        </p>
                        <p className="text-sm text-gray-600">Compliance reports</p>
                      </div>
                    </div>
                  </button>

                  <button className="bg-white rounded-xl shadow-2xl border-4 border-gray-100
                                   p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-uva-orange
                                   hover:-translate-y-2 transition-all duration-300
                                   text-left group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-uva-navy to-uva-navy/80
                                    rounded-xl group-hover:from-uva-orange
                                    group-hover:to-uva-orange-light transition-all">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-bold text-uva-navy">
                          Alerts
                        </p>
                        <p className="text-sm text-gray-600">Active issues</p>
                      </div>
                    </div>
                  </button>

                  <button className="bg-white rounded-xl shadow-2xl border-4 border-gray-100
                                   p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-uva-orange
                                   hover:-translate-y-2 transition-all duration-300
                                   text-left group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-uva-navy to-uva-navy/80
                                    rounded-xl group-hover:from-uva-orange
                                    group-hover:to-uva-orange-light transition-all">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-bold text-uva-navy">
                          Reports
                        </p>
                        <p className="text-sm text-gray-600">Generate exports</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />

      {/* CSV Uploader Modal */}
      {showCSVUploader && (
        <CSVUploader
          onUpload={handleCSVUpload}
          onClose={handleCSVUploadComplete}
        />
      )}
    </div>
  )
}
