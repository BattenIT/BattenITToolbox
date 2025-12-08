export type InventoryCategory =
  | 'computer'
  | 'monitor'
  | 'printer'
  | 'networking'
  | 'audio-visual'
  | 'peripheral'
  | 'software'
  | 'furniture'
  | 'other';

export type InventoryStatus = 'active' | 'in-storage' | 'needs-repair' | 'retired' | 'on-order';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetTag?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  warrantyExpiration?: Date;
  assignedTo?: string;
  location?: string;
  department?: string;
  status: InventoryStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  byCategory: Record<InventoryCategory, number>;
  byStatus: Record<InventoryStatus, number>;
  warrantyExpiringSoon: number; // Within 90 days
  recentlyAdded: number; // Last 30 days
}

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  'computer': 'Computer',
  'monitor': 'Monitor',
  'printer': 'Printer',
  'networking': 'Networking Equipment',
  'audio-visual': 'Audio/Visual',
  'peripheral': 'Peripheral',
  'software': 'Software License',
  'furniture': 'Furniture',
  'other': 'Other',
};

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  'active': 'Active',
  'in-storage': 'In Storage',
  'needs-repair': 'Needs Repair',
  'retired': 'Retired',
  'on-order': 'On Order',
};

export const CATEGORY_COLORS: Record<InventoryCategory, string> = {
  'computer': '#3b82f6',
  'monitor': '#8b5cf6',
  'printer': '#10b981',
  'networking': '#f59e0b',
  'audio-visual': '#ef4444',
  'peripheral': '#6366f1',
  'software': '#ec4899',
  'furniture': '#84cc16',
  'other': '#6b7280',
};

export const STATUS_COLORS: Record<InventoryStatus, string> = {
  'active': '#22c55e',
  'in-storage': '#3b82f6',
  'needs-repair': '#f59e0b',
  'retired': '#6b7280',
  'on-order': '#8b5cf6',
};
