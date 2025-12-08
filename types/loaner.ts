export type LoanerStatus = 'available' | 'checked-out' | 'maintenance' | 'retired';

export interface LoanerLaptop {
  id: string;
  assetTag: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: LoanerStatus;
  // Current loan info (if checked out)
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerDepartment?: string;
  checkoutDate?: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  // Device details
  specs?: string;
  condition?: string;
  notes?: string;
  // History tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanHistory {
  id: string;
  loanerId: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerDepartment?: string;
  checkoutDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  notes?: string;
}

export interface LoanerSummary {
  totalLoaners: number;
  available: number;
  checkedOut: number;
  inMaintenance: number;
  retired: number;
  overdueCount: number; // Past expected return date
}

export const STATUS_LABELS: Record<LoanerStatus, string> = {
  'available': 'Available',
  'checked-out': 'Checked Out',
  'maintenance': 'In Maintenance',
  'retired': 'Retired',
};

export const STATUS_COLORS: Record<LoanerStatus, string> = {
  'available': '#22c55e',
  'checked-out': '#f59e0b',
  'maintenance': '#3b82f6',
  'retired': '#6b7280',
};

export const STATUS_BADGE_CLASSES: Record<LoanerStatus, string> = {
  'available': 'bg-green-50 text-green-700 border-green-200',
  'checked-out': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'maintenance': 'bg-blue-50 text-blue-700 border-blue-200',
  'retired': 'bg-gray-50 text-gray-700 border-gray-200',
};
