/**
 * Model Number Lookup Utility
 * Converts cryptic model identifiers to human-friendly names
 * Also provides release year data for age calculation and MSRP for value estimation
 */

interface ModelInfo {
  name: string
  year: number
  msrp?: number  // Original MSRP in USD
}

/**
 * Apple Mac model identifier to friendly name and release year mapping
 * Based on data from AppleDB and EveryMac
 */
const APPLE_MODEL_MAP: Record<string, ModelInfo> = {
  // MacBook Air - M4 (2025) - MSRP: $1099 (13"), $1299 (15")
  'Mac16,13': { name: 'MacBook Air 15" (M4, 2025)', year: 2025, msrp: 1299 },
  'Mac16,12': { name: 'MacBook Air 13" (M4, 2025)', year: 2025, msrp: 1099 },

  // MacBook Air - M3 (2024) - MSRP: $1099 (13"), $1299 (15")
  'Mac15,13': { name: 'MacBook Air 15" (M3, 2024)', year: 2024, msrp: 1299 },
  'Mac15,12': { name: 'MacBook Air 13" (M3, 2024)', year: 2024, msrp: 1099 },

  // MacBook Air - M2 (2022-2023) - MSRP: $1099 (13"), $1299 (15")
  'Mac14,15': { name: 'MacBook Air 15" (M2, 2023)', year: 2023, msrp: 1299 },
  'Mac14,2': { name: 'MacBook Air 13" (M2, 2022)', year: 2022, msrp: 1199 },

  // MacBook Air - M1 (2020) - MSRP: $999
  'MacBookAir10,1': { name: 'MacBook Air 13" (M1, 2020)', year: 2020, msrp: 999 },

  // MacBook Air - Intel (2020) - MSRP: $999
  'MacBookAir9,1': { name: 'MacBook Air 13" (Intel, 2020)', year: 2020, msrp: 999 },

  // MacBook Pro - M4 (2024) - MSRP: $1599 (base), $1999 (Pro), $2499 (16" Pro), $3499 (Max)
  'Mac16,1': { name: 'MacBook Pro 14" (M4, 2024)', year: 2024, msrp: 1599 },
  'Mac16,6': { name: 'MacBook Pro 14" (M4 Pro, 2024)', year: 2024, msrp: 1999 },
  'Mac16,8': { name: 'MacBook Pro 14" (M4 Max, 2024)', year: 2024, msrp: 3199 },
  'Mac16,5': { name: 'MacBook Pro 16" (M4 Pro, 2024)', year: 2024, msrp: 2499 },
  'Mac16,7': { name: 'MacBook Pro 16" (M4 Max, 2024)', year: 2024, msrp: 3499 },

  // MacBook Pro - M3 (2023-2024) - MSRP: $1599 (base), $1999 (Pro), $2499 (16" Pro), $3499 (Max)
  'Mac15,3': { name: 'MacBook Pro 14" (M3, 2023)', year: 2023, msrp: 1599 },
  'Mac15,6': { name: 'MacBook Pro 14" (M3 Pro, 2023)', year: 2023, msrp: 1999 },
  'Mac15,8': { name: 'MacBook Pro 14" (M3 Max, 2023)', year: 2023, msrp: 2999 },
  'Mac15,10': { name: 'MacBook Pro 14" (M3 Max, 2023)', year: 2023, msrp: 2999 },
  'Mac15,7': { name: 'MacBook Pro 16" (M3 Pro, 2023)', year: 2023, msrp: 2499 },
  'Mac15,9': { name: 'MacBook Pro 16" (M3 Max, 2023)', year: 2023, msrp: 3499 },
  'Mac15,11': { name: 'MacBook Pro 16" (M3 Max, 2023)', year: 2023, msrp: 3499 },

  // MacBook Pro - M2 (2022-2023) - MSRP: $1299 (13"), $1999 (14" Pro), $2499 (16" Pro)
  'Mac14,5': { name: 'MacBook Pro 14" (M2 Pro, 2023)', year: 2023, msrp: 1999 },
  'Mac14,9': { name: 'MacBook Pro 14" (M2 Max, 2023)', year: 2023, msrp: 2999 },
  'Mac14,6': { name: 'MacBook Pro 16" (M2 Pro, 2023)', year: 2023, msrp: 2499 },
  'Mac14,10': { name: 'MacBook Pro 16" (M2 Max, 2023)', year: 2023, msrp: 3499 },
  'Mac14,7': { name: 'MacBook Pro 13" (M2, 2022)', year: 2022, msrp: 1299 },

  // MacBook Pro - M1 (2020-2021) - MSRP: $1299 (13"), $1999 (14" Pro), $2499 (16" Pro)
  'MacBookPro18,1': { name: 'MacBook Pro 16" (M1 Pro, 2021)', year: 2021, msrp: 2499 },
  'MacBookPro18,2': { name: 'MacBook Pro 16" (M1 Max, 2021)', year: 2021, msrp: 3499 },
  'MacBookPro18,3': { name: 'MacBook Pro 14" (M1 Pro, 2021)', year: 2021, msrp: 1999 },
  'MacBookPro18,4': { name: 'MacBook Pro 14" (M1 Max, 2021)', year: 2021, msrp: 2999 },
  'MacBookPro17,1': { name: 'MacBook Pro 13" (M1, 2020)', year: 2020, msrp: 1299 },

  // MacBook Pro - Intel (2017-2020) - MSRP varied by config
  'MacBookPro16,1': { name: 'MacBook Pro 16" (Intel, 2019)', year: 2019, msrp: 2399 },
  'MacBookPro16,2': { name: 'MacBook Pro 13" (Intel, 2020)', year: 2020, msrp: 1799 },
  'MacBookPro16,3': { name: 'MacBook Pro 13" (Intel, 2020)', year: 2020, msrp: 1299 },
  'MacBookPro16,4': { name: 'MacBook Pro 16" (Intel, 2020)', year: 2020, msrp: 2399 },
  'MacBookPro15,1': { name: 'MacBook Pro 15" (Intel, 2019)', year: 2019, msrp: 2399 },
  'MacBookPro15,2': { name: 'MacBook Pro 13" (Intel, 2019)', year: 2019, msrp: 1799 },
  'MacBookPro15,3': { name: 'MacBook Pro 15" (Intel, 2019)', year: 2019, msrp: 2799 },
  'MacBookPro15,4': { name: 'MacBook Pro 13" (Intel, 2019)', year: 2019, msrp: 1299 },
  'MacBookPro14,1': { name: 'MacBook Pro 13" (Intel, 2017)', year: 2017, msrp: 1299 },
  'MacBookPro14,2': { name: 'MacBook Pro 13" (Intel, 2017)', year: 2017, msrp: 1799 },
  'MacBookPro14,3': { name: 'MacBook Pro 15" (Intel, 2017)', year: 2017, msrp: 2399 },

  // iMac - M4 (2024) - MSRP: $1299 (base), $1499 (10-core GPU)
  'Mac16,2': { name: 'iMac 24" (M4, 2024)', year: 2024, msrp: 1299 },
  'Mac16,3': { name: 'iMac 24" (M4, 2024)', year: 2024, msrp: 1499 },

  // iMac - M3 (2023) - MSRP: $1299 (base), $1499 (10-core GPU)
  'Mac15,4': { name: 'iMac 24" (M3, 2023)', year: 2023, msrp: 1299 },
  'Mac15,5': { name: 'iMac 24" (M3, 2023)', year: 2023, msrp: 1499 },

  // iMac - M1 (2021) - MSRP: $1299
  'iMac21,1': { name: 'iMac 24" (M1, 2021)', year: 2021, msrp: 1299 },
  'iMac21,2': { name: 'iMac 24" (M1, 2021)', year: 2021, msrp: 1499 },

  // iMac - Intel (2017-2020) - MSRP varied
  'iMac20,1': { name: 'iMac 27" (Intel, 2020)', year: 2020, msrp: 1799 },
  'iMac20,2': { name: 'iMac 27" (Intel, 2020)', year: 2020, msrp: 1999 },
  'iMac19,1': { name: 'iMac 27" (Intel, 2019)', year: 2019, msrp: 1799 },
  'iMac19,2': { name: 'iMac 21.5" (Intel, 2019)', year: 2019, msrp: 1299 },
  'iMac18,1': { name: 'iMac 21.5" (Intel, 2017)', year: 2017, msrp: 1099 },
  'iMac18,2': { name: 'iMac 21.5" 4K (Intel, 2017)', year: 2017, msrp: 1299 },
  'iMac18,3': { name: 'iMac 27" 5K (Intel, 2017)', year: 2017, msrp: 1799 },
  'iMac15,1': { name: 'iMac 27" 5K (Intel, 2014)', year: 2014, msrp: 2499 },

  // iMac Pro - MSRP: $4999
  'iMacPro1,1': { name: 'iMac Pro 27" (Intel Xeon, 2017)', year: 2017, msrp: 4999 },

  // Mac mini - M4 (2024) - MSRP: $599 (base), $1399 (Pro)
  'Mac16,10': { name: 'Mac mini (M4, 2024)', year: 2024, msrp: 599 },
  'Mac16,11': { name: 'Mac mini (M4 Pro, 2024)', year: 2024, msrp: 1399 },

  // Mac mini - M2 (2023) - MSRP: $599 (base), $1299 (Pro)
  'Mac14,3': { name: 'Mac mini (M2, 2023)', year: 2023, msrp: 599 },
  'Mac14,12': { name: 'Mac mini (M2 Pro, 2023)', year: 2023, msrp: 1299 },

  // Mac mini - M1 (2020) - MSRP: $699
  'Macmini9,1': { name: 'Mac mini (M1, 2020)', year: 2020, msrp: 699 },

  // Mac mini - Intel - MSRP varied
  'Macmini8,1': { name: 'Mac mini (Intel, 2018)', year: 2018, msrp: 799 },
  'Macmini7,1': { name: 'Mac mini (Intel, 2014)', year: 2014, msrp: 499 },
  'Macmini6,1': { name: 'Mac mini (Intel, 2012)', year: 2012, msrp: 599 },
  'Macmini6,2': { name: 'Mac mini (Intel, 2012)', year: 2012, msrp: 799 },

  // Mac Studio (2022-2025) - MSRP: $1999 (Max), $3999 (Ultra)
  'Mac16,9': { name: 'Mac Studio (M3 Ultra, 2025)', year: 2025, msrp: 3999 },
  'Mac15,14': { name: 'Mac Studio (M3 Ultra, 2025)', year: 2025, msrp: 3999 },
  'Mac14,13': { name: 'Mac Studio (M2 Max, 2023)', year: 2023, msrp: 1999 },
  'Mac14,14': { name: 'Mac Studio (M2 Ultra, 2023)', year: 2023, msrp: 3999 },
  'Mac13,1': { name: 'Mac Studio (M1 Max, 2022)', year: 2022, msrp: 1999 },
  'Mac13,2': { name: 'Mac Studio (M1 Ultra, 2022)', year: 2022, msrp: 3999 },

  // Mac Pro - MSRP: $6999
  'Mac14,8': { name: 'Mac Pro (M2 Ultra, 2023)', year: 2023, msrp: 6999 },
}

/**
 * Lenovo ThinkPad model number prefixes to friendly name and release year mapping
 * Maps Machine Type (first 4 chars) to model info
 */
const LENOVO_PREFIX_MAP: Record<string, ModelInfo> = {
  // ThinkPad X1 Carbon series - Premium business ultrabook ($1500-$2500 range)
  '21HM': { name: 'ThinkPad X1 Carbon Gen 11', year: 2023, msrp: 1649 },
  '21HN': { name: 'ThinkPad X1 Carbon Gen 11', year: 2023, msrp: 1649 },
  '21KC': { name: 'ThinkPad X1 Carbon Gen 12', year: 2024, msrp: 1699 },
  '21KD': { name: 'ThinkPad X1 Carbon Gen 12', year: 2024, msrp: 1699 },
  '21CB': { name: 'ThinkPad X1 Carbon Gen 10', year: 2022, msrp: 1549 },
  '21CC': { name: 'ThinkPad X1 Carbon Gen 10', year: 2022, msrp: 1549 },
  '20XW': { name: 'ThinkPad X1 Carbon Gen 9', year: 2021, msrp: 1429 },
  '20XX': { name: 'ThinkPad X1 Carbon Gen 9', year: 2021, msrp: 1429 },
  '20KH': { name: 'ThinkPad X1 Carbon Gen 6', year: 2018, msrp: 1399 },
  '20KG': { name: 'ThinkPad X1 Carbon Gen 6', year: 2018, msrp: 1399 },
  '20FB': { name: 'ThinkPad X1 Carbon Gen 4', year: 2016, msrp: 1299 },
  '20FC': { name: 'ThinkPad X1 Carbon Gen 4', year: 2016, msrp: 1299 },

  // ThinkPad X1 Yoga series - Premium 2-in-1 ($1600-$2600 range)
  '21JR': { name: 'ThinkPad X1 Yoga Gen 8', year: 2023, msrp: 1749 },
  '21JS': { name: 'ThinkPad X1 Yoga Gen 8', year: 2023, msrp: 1749 },
  '21CD': { name: 'ThinkPad X1 Yoga Gen 7', year: 2022, msrp: 1649 },
  '21CE': { name: 'ThinkPad X1 Yoga Gen 7', year: 2022, msrp: 1649 },

  // ThinkPad P series (workstations) - P16s: $1200-$1800, P1: $2000-$4000
  '21HK': { name: 'ThinkPad P16s Gen 2', year: 2023, msrp: 1399 },
  '21HL': { name: 'ThinkPad P16s Gen 2', year: 2023, msrp: 1399 },
  '21KS': { name: 'ThinkPad P16s Gen 3', year: 2024, msrp: 1499 },
  '21KT': { name: 'ThinkPad P16s Gen 3', year: 2024, msrp: 1499 },
  '21H3': { name: 'ThinkPad P1 Gen 6', year: 2023, msrp: 2299 },
  '21H4': { name: 'ThinkPad P1 Gen 6', year: 2023, msrp: 2299 },
  '21NS': { name: 'ThinkPad P1 Gen 7', year: 2024, msrp: 2499 },
  '21NT': { name: 'ThinkPad P1 Gen 7', year: 2024, msrp: 2499 },

  // ThinkPad T series - Mainstream business ($1000-$1800 range)
  '21MC': { name: 'ThinkPad T14 Gen 5', year: 2024, msrp: 1199 },
  '21MD': { name: 'ThinkPad T14 Gen 5', year: 2024, msrp: 1199 },
  '21DJ': { name: 'ThinkPad T14 Gen 4', year: 2023, msrp: 1099 },
  '21DK': { name: 'ThinkPad T14 Gen 4', year: 2023, msrp: 1099 },
  '20UN': { name: 'ThinkPad T14 Gen 1', year: 2020, msrp: 899 },
  '20UD': { name: 'ThinkPad T14 Gen 1', year: 2020, msrp: 899 },

  // ThinkPad L series - Budget business ($700-$1200 range)
  '21H1': { name: 'ThinkPad L14 Gen 4', year: 2023, msrp: 799 },
  '21H2': { name: 'ThinkPad L14 Gen 4', year: 2023, msrp: 799 },

  // ThinkPad E series - Entry business ($600-$1000 range)
  '21JN': { name: 'ThinkPad E16 Gen 1', year: 2023, msrp: 749 },
  '21JM': { name: 'ThinkPad E16 Gen 1', year: 2023, msrp: 749 },

  // ThinkPad X series - Compact ultraportable ($1000-$1600 range)
  '20W6': { name: 'ThinkPad X13 Gen 2', year: 2021, msrp: 1099 },
  '20WK': { name: 'ThinkPad X13 Gen 2', year: 2021, msrp: 1099 },

  // ThinkStation / ThinkCentre - Desktop workstation ($1500-$3000 range)
  '30FM': { name: 'ThinkStation P360 Ultra', year: 2022, msrp: 1699 },
  '30FN': { name: 'ThinkStation P360 Ultra', year: 2022, msrp: 1699 },

  // IdeaPad series (consumer) - $500-$900 range
  '83A4': { name: 'IdeaPad Slim 5', year: 2023, msrp: 699 },
  '83A5': { name: 'IdeaPad Slim 5', year: 2023, msrp: 699 },
}

/**
 * Dell model to release year mapping
 */
const DELL_MODEL_MAP: Record<string, ModelInfo> = {
  'Latitude 5320': { name: 'Dell Latitude 5320', year: 2021, msrp: 1199 },
  'Latitude 5550': { name: 'Dell Latitude 5550', year: 2024, msrp: 1349 },
  'Latitude 7320': { name: 'Dell Latitude 7320', year: 2021, msrp: 1549 },
  'OptiPlex 9020 AIO': { name: 'Dell OptiPlex 9020 All-in-One', year: 2014, msrp: 999 },
  'OptiPlex 7080': { name: 'Dell OptiPlex 7080', year: 2020, msrp: 899 },
  'Dell Inc. OptiPlex Micro Plus 7020': { name: 'Dell OptiPlex Micro Plus 7020', year: 2024, msrp: 999 },
  'Dell Inc. OptiPlex Micro 7010': { name: 'Dell OptiPlex Micro 7010', year: 2023, msrp: 849 },
  'Inspiron 16 5620': { name: 'Dell Inspiron 16 5620', year: 2022, msrp: 799 },
}

/**
 * Microsoft Surface model mapping
 */
const SURFACE_MODEL_MAP: Record<string, ModelInfo> = {
  'Surface Pro': { name: 'Microsoft Surface Pro', year: 2017, msrp: 799 },
  'Surface Pro 8': { name: 'Microsoft Surface Pro 8', year: 2021, msrp: 1099 },
  'Surface Pro 9': { name: 'Microsoft Surface Pro 9', year: 2022, msrp: 999 },
  'Surface Pro 10': { name: 'Microsoft Surface Pro 10', year: 2024, msrp: 1199 },
}

/**
 * Look up model info (name and year) from a model identifier
 * @param modelId The raw model identifier (e.g., "Mac15,13", "21HK003MUS")
 * @returns ModelInfo with name and year, or null if no match found
 */
export function lookupModelInfo(modelId: string): ModelInfo | null {
  if (!modelId || modelId === 'Unknown') {
    return null
  }

  const trimmed = modelId.trim()

  // Check Apple models (exact match)
  if (APPLE_MODEL_MAP[trimmed]) {
    return APPLE_MODEL_MAP[trimmed]
  }

  // Check Lenovo prefix (first 4 characters)
  const prefix = trimmed.substring(0, 4).toUpperCase()
  if (LENOVO_PREFIX_MAP[prefix]) {
    return LENOVO_PREFIX_MAP[prefix]
  }

  // Check Dell models
  if (DELL_MODEL_MAP[trimmed]) {
    return DELL_MODEL_MAP[trimmed]
  }

  // Check if it contains Dell keywords and try to extract year from model number
  if (trimmed.includes('Latitude') || trimmed.includes('OptiPlex') || trimmed.includes('Inspiron') || trimmed.includes('Dell')) {
    // Try to extract year from model (e.g., Latitude 5320 -> 2021 based on model number patterns)
    const modelNum = trimmed.match(/(\d{4})/)?.[1]
    if (modelNum) {
      // Dell model numbers often encode year: first digit is generation
      // 5xxx = 2021, 7xxx = varies by series
      const cleanName = trimmed.replace('Dell Inc. ', 'Dell ')
      return { name: cleanName, year: 0 } // Year 0 means unknown
    }
    return { name: trimmed.replace('Dell Inc. ', 'Dell '), year: 0 }
  }

  // Check Surface models
  if (SURFACE_MODEL_MAP[trimmed]) {
    return SURFACE_MODEL_MAP[trimmed]
  }

  // Check if it contains Surface
  if (trimmed.includes('Surface')) {
    // Try to extract generation number
    const genMatch = trimmed.match(/Pro\s*(\d+)/i)
    if (genMatch) {
      const gen = parseInt(genMatch[1])
      // Surface Pro generations: 8 = 2021, 9 = 2022, 10 = 2023
      const yearMap: Record<number, number> = { 8: 2021, 9: 2022, 10: 2023 }
      return { name: `Microsoft ${trimmed}`, year: yearMap[gen] || 0 }
    }
    return { name: `Microsoft ${trimmed}`, year: 0 }
  }

  return null
}

/**
 * Look up a friendly model name from a model identifier
 * @param modelId The raw model identifier (e.g., "Mac15,13", "21HK003MUS")
 * @returns Friendly model name or original if no match found
 */
export function lookupModelName(modelId: string): string {
  if (!modelId || modelId === 'Unknown') {
    return 'Unknown Model'
  }

  const info = lookupModelInfo(modelId)
  if (info) {
    return info.name
  }

  const trimmed = modelId.trim()

  // If it looks like an Apple identifier (starts with Mac, iMac, MacBook, etc.)
  if (/^(Mac|iMac|MacBook|Macmini)\d/.test(trimmed)) {
    // Return a generic name based on the prefix
    if (trimmed.startsWith('MacBookPro')) {
      return `MacBook Pro (${trimmed})`
    }
    if (trimmed.startsWith('MacBookAir')) {
      return `MacBook Air (${trimmed})`
    }
    if (trimmed.startsWith('iMac')) {
      return `iMac (${trimmed})`
    }
    if (trimmed.startsWith('Macmini')) {
      return `Mac mini (${trimmed})`
    }
    if (trimmed.startsWith('Mac')) {
      return `Mac (${trimmed})`
    }
  }

  // If it looks like a Lenovo part number (10 digits starting with 2)
  if (/^2[0-9A-Z]{9}$/.test(trimmed)) {
    return `Lenovo (${trimmed})`
  }

  // Return original if no match
  return trimmed
}

/**
 * Get the release year for a model
 * @param modelId The raw model identifier
 * @returns Release year or 0 if unknown
 */
export function getModelReleaseYear(modelId: string): number {
  if (!modelId || modelId === 'Unknown') {
    return 0
  }

  const info = lookupModelInfo(modelId)
  if (info) {
    return info.year
  }

  // Try to extract year from the friendly model name (e.g., "MacBook Pro 14" (M3, 2023)")
  const trimmed = modelId.trim()
  const yearMatch = trimmed.match(/\b(20[1-2]\d)\b/)
  if (yearMatch) {
    return parseInt(yearMatch[1])
  }

  return 0
}

/**
 * Get manufacturer from model identifier
 */
export function getManufacturerFromModel(modelId: string): string {
  if (!modelId) return 'Unknown'

  const trimmed = modelId.trim()

  // Apple identifiers
  if (/^(Mac|iMac|MacBook|Macmini)/.test(trimmed)) {
    return 'Apple'
  }

  // Lenovo identifiers (typically start with 2 followed by alphanumerics, or 83 for consumer)
  if (/^(2[0-9A-Z]|83)/.test(trimmed) || LENOVO_PREFIX_MAP[trimmed.substring(0, 4)]) {
    return 'Lenovo'
  }

  // Dell keywords
  if (trimmed.includes('Latitude') || trimmed.includes('OptiPlex') || trimmed.includes('Inspiron') || trimmed.includes('Dell')) {
    return 'Dell'
  }

  // Microsoft Surface
  if (trimmed.includes('Surface')) {
    return 'Microsoft'
  }

  return 'Unknown'
}

/**
 * Calculate device age in years based on model release year
 * @param modelId The raw model identifier
 * @returns Age in years (decimal) or 0 if year unknown
 */
export function calculateAgeFromModel(modelId: string): number {
  const releaseYear = getModelReleaseYear(modelId)
  if (releaseYear === 0) {
    return 0
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Assume mid-year release (June) if we only have year
  // This gives a more accurate age estimate
  const releaseDate = new Date(releaseYear, 5, 1) // June 1st of release year
  const ageMs = now.getTime() - releaseDate.getTime()
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)

  return Math.max(0, parseFloat(ageYears.toFixed(1)))
}

/**
 * Get the MSRP (original retail price) for a model
 * @param modelId The raw model identifier
 * @returns MSRP in USD or undefined if unknown
 */
export function getModelMSRP(modelId: string): number | undefined {
  if (!modelId || modelId === 'Unknown') {
    return undefined
  }

  const info = lookupModelInfo(modelId)
  return info?.msrp
}

/**
 * Default MSRP estimates by device category when specific model is unknown
 */
const DEFAULT_MSRP: Record<string, number> = {
  'MacBook Air': 1199,
  'MacBook Pro': 1999,
  'iMac': 1299,
  'Mac mini': 699,
  'Mac Studio': 1999,
  'Mac Pro': 6999,
  'ThinkPad': 1299,
  'Latitude': 1199,
  'OptiPlex': 899,
  'Surface': 999,
  'Unknown': 1000,
}

/**
 * Get estimated MSRP for a model, with fallback to category defaults
 * @param modelId The raw model identifier
 * @param modelName The friendly model name (for fallback category matching)
 * @returns Estimated MSRP in USD
 */
export function getEstimatedMSRP(modelId: string, modelName?: string): number {
  // First try to get exact MSRP
  const exactMSRP = getModelMSRP(modelId)
  if (exactMSRP) {
    return exactMSRP
  }

  // Fall back to category-based estimate
  const nameToCheck = modelName || lookupModelName(modelId)

  for (const [category, msrp] of Object.entries(DEFAULT_MSRP)) {
    if (nameToCheck.includes(category)) {
      return msrp
    }
  }

  return DEFAULT_MSRP['Unknown']
}

/**
 * Calculate current estimated value using straight-line depreciation
 * Assumes 5-year useful life with 10% residual value (common IT asset depreciation)
 *
 * @param msrp Original purchase price (MSRP)
 * @param ageInYears Age of the device in years
 * @param usefulLife Useful life in years (default 5 for IT equipment)
 * @param residualPercent Residual value as percentage (default 10%)
 * @returns Current estimated value
 */
export function calculateDepreciatedValue(
  msrp: number,
  ageInYears: number,
  usefulLife: number = 5,
  residualPercent: number = 10
): number {
  if (msrp <= 0 || ageInYears < 0) {
    return 0
  }

  const residualValue = msrp * (residualPercent / 100)
  const depreciableAmount = msrp - residualValue
  const annualDepreciation = depreciableAmount / usefulLife

  // Calculate remaining value
  const depreciation = annualDepreciation * Math.min(ageInYears, usefulLife)
  const currentValue = msrp - depreciation

  // Never go below residual value
  return Math.max(residualValue, Math.round(currentValue))
}

/**
 * Get device value information including MSRP and current estimated value
 * @param modelId The raw model identifier
 * @param modelName Optional friendly model name for fallback
 * @returns Object with msrp, currentValue, and depreciationPercent
 */
export function getDeviceValue(modelId: string, modelName?: string): {
  msrp: number
  currentValue: number
  depreciationPercent: number
  ageInYears: number
} {
  const msrp = getEstimatedMSRP(modelId, modelName)
  const ageInYears = calculateAgeFromModel(modelId)
  const currentValue = calculateDepreciatedValue(msrp, ageInYears)
  const depreciationPercent = msrp > 0 ? Math.round(((msrp - currentValue) / msrp) * 100) : 0

  return {
    msrp,
    currentValue,
    depreciationPercent,
    ageInYears
  }
}
