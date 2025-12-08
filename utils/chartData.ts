/**
 * Chart Data Processing
 * Transforms device data for visualization
 */

import { Device } from '@/types/device'

export interface ChartDataPoint {
  name: string
  value: number
  percentage?: number
  fill?: string
  [key: string]: string | number | undefined
}

/**
 * Get OS Type distribution (Windows vs macOS)
 */
export function getOSTypeDistribution(devices: Device[]): ChartDataPoint[] {
  const macCount = devices.filter(d => d.osType === 'macOS').length
  const windowsCount = devices.filter(d => d.osType === 'Windows').length
  const total = devices.length

  return [
    {
      name: 'macOS',
      value: macCount,
      percentage: total > 0 ? (macCount / total) * 100 : 0,
      fill: '#232D4B', // UVA Navy
    },
    {
      name: 'Windows',
      value: windowsCount,
      percentage: total > 0 ? (windowsCount / total) * 100 : 0,
      fill: '#E57200', // UVA Orange
    },
  ]
}

/**
 * Get source distribution (Jamf vs Intune)
 */
export function getSourceDistribution(devices: Device[]): ChartDataPoint[] {
  const jamfCount = devices.filter(d => d.source === 'jamf').length
  const intuneCount = devices.filter(d => d.source === 'intune').length
  const total = devices.length

  return [
    {
      name: 'Jamf',
      value: jamfCount,
      percentage: total > 0 ? (jamfCount / total) * 100 : 0,
      fill: '#232D4B',
    },
    {
      name: 'Intune',
      value: intuneCount,
      percentage: total > 0 ? (intuneCount / total) * 100 : 0,
      fill: '#0078D4',
    },
  ]
}

/**
 * Get device age distribution by ranges
 */
export function getAgeDistribution(devices: Device[]): ChartDataPoint[] {
  const ranges = {
    '0-1 years': 0,
    '1-2 years': 0,
    '2-3 years': 0,
    '3-4 years': 0,
    '4+ years': 0,
  }

  devices.forEach(device => {
    const age = device.ageInYears
    if (age < 1) ranges['0-1 years']++
    else if (age < 2) ranges['1-2 years']++
    else if (age < 3) ranges['2-3 years']++
    else if (age < 4) ranges['3-4 years']++
    else ranges['4+ years']++
  })

  return Object.entries(ranges).map(([name, value]) => ({
    name,
    value,
    fill: name === '0-1 years' ? '#22c55e'
      : name === '1-2 years' ? '#84cc16'
      : name === '2-3 years' ? '#eab308'
      : name === '3-4 years' ? '#f97316'
      : '#ef4444',
  }))
}

/**
 * Get top device models
 */
export function getTopModels(devices: Device[], limit = 10): ChartDataPoint[] {
  const modelCounts = new Map<string, number>()

  devices.forEach(device => {
    const model = device.model || 'Unknown'
    modelCounts.set(model, (modelCounts.get(model) || 0) + 1)
  })

  return Array.from(modelCounts.entries())
    .map(([name, value]) => ({ name, value, fill: '#232D4B' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/**
 * Get OS version distribution
 */
export function getOSVersionDistribution(devices: Device[]): ChartDataPoint[] {
  const versionCounts = new Map<string, number>()

  devices.forEach(device => {
    const version = device.osVersion || 'Unknown'
    versionCounts.set(version, (versionCounts.get(version) || 0) + 1)
  })

  return Array.from(versionCounts.entries())
    .map(([name, value]) => ({ name, value, fill: '#232D4B' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15) // Top 15 versions
}

/**
 * Get status distribution
 */
export function getStatusDistribution(devices: Device[]): ChartDataPoint[] {
  const critical = devices.filter(d => d.status === 'critical').length
  const warning = devices.filter(d => d.status === 'warning').length
  const good = devices.filter(d => d.status === 'good').length
  const inactive = devices.filter(d => d.status === 'inactive').length
  const unknown = devices.filter(d => d.status === 'unknown').length
  const total = devices.length

  return [
    {
      name: 'Critical',
      value: critical,
      percentage: total > 0 ? (critical / total) * 100 : 0,
      fill: '#ef4444',
    },
    {
      name: 'Warning',
      value: warning,
      percentage: total > 0 ? (warning / total) * 100 : 0,
      fill: '#f59e0b',
    },
    {
      name: 'Good',
      value: good,
      percentage: total > 0 ? (good / total) * 100 : 0,
      fill: '#22c55e',
    },
    {
      name: 'Inactive',
      value: inactive,
      percentage: total > 0 ? (inactive / total) * 100 : 0,
      fill: '#6b7280',
    },
    {
      name: 'Unknown',
      value: unknown,
      percentage: total > 0 ? (unknown / total) * 100 : 0,
      fill: '#9ca3af',
    },
  ].filter(item => item.value > 0)
}

/**
 * Get activity timeline (last check-in ranges)
 */
export function getActivityTimeline(devices: Device[]): ChartDataPoint[] {
  const ranges = {
    '0-7 days': 0,
    '8-14 days': 0,
    '15-30 days': 0,
    '31-60 days': 0,
    '60+ days': 0,
  }

  devices.forEach(device => {
    const days = device.daysSinceUpdate || 0
    if (days <= 7) ranges['0-7 days']++
    else if (days <= 14) ranges['8-14 days']++
    else if (days <= 30) ranges['15-30 days']++
    else if (days <= 60) ranges['31-60 days']++
    else ranges['60+ days']++
  })

  return Object.entries(ranges).map(([name, value]) => ({
    name,
    value,
    fill: name === '0-7 days' ? '#22c55e'
      : name === '8-14 days' ? '#84cc16'
      : name === '15-30 days' ? '#eab308'
      : name === '31-60 days' ? '#f97316'
      : '#ef4444',
  }))
}

/**
 * Get replacement timeline by fiscal year
 */
export function getReplacementTimeline(devices: Device[]): ChartDataPoint[] {
  const critical = devices.filter(d => d.status === 'critical').length
  const warning = devices.filter(d => d.status === 'warning').length
  const good = devices.filter(d => d.status === 'good').length

  return [
    {
      name: 'FY 2025 (Immediate)',
      value: critical,
      fill: '#ef4444',
    },
    {
      name: 'FY 2026 (Next Year)',
      value: warning,
      fill: '#f59e0b',
    },
    {
      name: 'FY 2027+ (Future)',
      value: good,
      fill: '#22c55e',
    },
  ]
}

/**
 * Get devices by department (top 10)
 */
export function getDepartmentDistribution(devices: Device[]): ChartDataPoint[] {
  const deptCounts = new Map<string, number>()

  devices.forEach(device => {
    const dept = device.department || 'Unassigned'
    deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1)
  })

  return Array.from(deptCounts.entries())
    .map(([name, value]) => ({ name, value, fill: '#232D4B' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

/**
 * Get users with multiple devices
 */
export function getMultiDeviceOwners(devices: Device[]): ChartDataPoint[] {
  const ownerCounts = new Map<string, number>()

  devices.forEach(device => {
    const owner = device.owner || 'Unassigned'
    if (owner !== 'Unassigned' && owner !== 'IT Admin' && owner !== 'System') {
      ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1)
    }
  })

  return Array.from(ownerCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([name, value]) => ({ name, value, fill: '#232D4B' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15)
}

/**
 * Get update compliance timeline
 */
export function getUpdateCompliance(devices: Device[]): ChartDataPoint[] {
  const ranges = {
    'Updated (0-7 days)': 0,
    'Recent (7-30 days)': 0,
    'Aging (30-60 days)': 0,
    'Stale (60-90 days)': 0,
    'Critical (90+ days)': 0,
  }

  devices.forEach(device => {
    const days = device.daysSinceUpdate || 0
    if (days <= 7) ranges['Updated (0-7 days)']++
    else if (days <= 30) ranges['Recent (7-30 days)']++
    else if (days <= 60) ranges['Aging (30-60 days)']++
    else if (days <= 90) ranges['Stale (60-90 days)']++
    else ranges['Critical (90+ days)']++
  })

  return Object.entries(ranges).map(([name, value]) => ({
    name,
    value,
    fill: name.includes('Updated') ? '#22c55e'
      : name.includes('Recent') ? '#84cc16'
      : name.includes('Aging') ? '#eab308'
      : name.includes('Stale') ? '#f97316'
      : '#ef4444',
  }))
}

/**
 * Get replacement cost projection
 */
export function getReplacementCostProjection(devices: Device[]): Array<{
  name: string
  cost: number
  devices: number
}> {
  const avgCost = 1500
  const critical = devices.filter(d => d.status === 'critical').length
  const warning = devices.filter(d => d.status === 'warning').length
  const flagged = devices.filter(d => d.replacementRecommended).length

  return [
    {
      name: 'FY 2025 (Critical)',
      cost: critical * avgCost,
      devices: critical,
    },
    {
      name: 'FY 2026 (Warning)',
      cost: warning * avgCost,
      devices: warning,
    },
    {
      name: 'Total Flagged',
      cost: flagged * avgCost,
      devices: flagged,
    },
  ]
}

/**
 * Get vulnerability severity distribution (Qualys)
 */
export function getVulnerabilitySeverityDistribution(devices: Device[]): ChartDataPoint[] {
  const devicesWithVulns = devices.filter(d => d.qualysAgentId)

  const severity5 = devicesWithVulns.reduce((sum, d) => sum + (d.criticalVulnCount5 || 0), 0)
  const severity4 = devicesWithVulns.reduce((sum, d) => sum + (d.highVulnCount || 0), 0)
  const otherVulns = devicesWithVulns.reduce((sum, d) => {
    const total = d.vulnerabilityCount || 0
    const critical = d.criticalVulnCount || 0
    return sum + (total - critical)
  }, 0)

  return [
    {
      name: 'Critical (Severity 5)',
      value: severity5,
      fill: '#dc2626', // red-600
    },
    {
      name: 'High (Severity 4)',
      value: severity4,
      fill: '#f97316', // orange-500
    },
    {
      name: 'Medium/Low (1-3)',
      value: otherVulns,
      fill: '#eab308', // yellow-500
    },
  ].filter(item => item.value > 0)
}

/**
 * Get TruRisk score distribution
 */
export function getTruRiskDistribution(devices: Device[]): ChartDataPoint[] {
  const ranges = {
    'Very High (800+)': 0,
    'High (600-799)': 0,
    'Medium (400-599)': 0,
    'Low (200-399)': 0,
    'Very Low (0-199)': 0,
  }

  devices.forEach(device => {
    const score = device.truRiskScore
    if (score === undefined) return

    if (score >= 800) ranges['Very High (800+)']++
    else if (score >= 600) ranges['High (600-799)']++
    else if (score >= 400) ranges['Medium (400-599)']++
    else if (score >= 200) ranges['Low (200-399)']++
    else ranges['Very Low (0-199)']++
  })

  return Object.entries(ranges).map(([name, value]) => ({
    name,
    value,
    fill: name.includes('Very High') ? '#dc2626'
      : name.includes('High') ? '#f97316'
      : name.includes('Medium') ? '#eab308'
      : name.includes('Low') && !name.includes('Very') ? '#84cc16'
      : '#22c55e',
  })).filter(item => item.value > 0)
}

/**
 * Get top vulnerable devices
 */
export function getTopVulnerableDevices(devices: Device[], limit = 10): Array<{
  name: string
  vulnerabilities: number
  critical: number
  truRisk: number
}> {
  return devices
    .filter(d => d.vulnerabilityCount && d.vulnerabilityCount > 0)
    .sort((a, b) => (b.vulnerabilityCount || 0) - (a.vulnerabilityCount || 0))
    .slice(0, limit)
    .map(d => ({
      name: d.name,
      vulnerabilities: d.vulnerabilityCount || 0,
      critical: d.criticalVulnCount || 0,
      truRisk: d.truRiskScore || 0,
    }))
}

/**
 * Get Qualys coverage (devices with/without Qualys data)
 */
export function getQualysCoverage(devices: Device[]): ChartDataPoint[] {
  const withQualys = devices.filter(d => d.qualysAgentId).length
  const withoutQualys = devices.length - withQualys
  const total = devices.length

  return [
    {
      name: 'With Qualys Data',
      value: withQualys,
      percentage: total > 0 ? (withQualys / total) * 100 : 0,
      fill: '#22c55e',
    },
    {
      name: 'Without Qualys Data',
      value: withoutQualys,
      percentage: total > 0 ? (withoutQualys / total) * 100 : 0,
      fill: '#9ca3af',
    },
  ].filter(item => item.value > 0)
}

/**
 * Get devices by vulnerability count ranges
 */
export function getVulnerabilityCountDistribution(devices: Device[]): ChartDataPoint[] {
  const ranges = {
    'No Vulnerabilities': 0,
    '1-5 Vulnerabilities': 0,
    '6-10 Vulnerabilities': 0,
    '11-20 Vulnerabilities': 0,
    '21+ Vulnerabilities': 0,
  }

  devices.forEach(device => {
    const count = device.vulnerabilityCount || 0

    if (count === 0) ranges['No Vulnerabilities']++
    else if (count <= 5) ranges['1-5 Vulnerabilities']++
    else if (count <= 10) ranges['6-10 Vulnerabilities']++
    else if (count <= 20) ranges['11-20 Vulnerabilities']++
    else ranges['21+ Vulnerabilities']++
  })

  return Object.entries(ranges).map(([name, value]) => ({
    name,
    value,
    fill: name === 'No Vulnerabilities' ? '#22c55e'
      : name === '1-5 Vulnerabilities' ? '#84cc16'
      : name === '6-10 Vulnerabilities' ? '#eab308'
      : name === '11-20 Vulnerabilities' ? '#f97316'
      : '#dc2626',
  })).filter(item => item.value > 0)
}
