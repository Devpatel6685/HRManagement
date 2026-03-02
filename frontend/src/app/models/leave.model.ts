export interface ApplyLeaveDto {
  leaveTypeId: string;
  fromDate: string;  // "YYYY-MM-DD"
  toDate: string;    // "YYYY-MM-DD"
  reason: string;
  availableOnPhone: boolean;
  alternativePhone: string;
}

export interface LeaveBalanceDto {
  id: string;
  leaveTypeId: string;
  leaveType: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveType: string;
  fromDate: string;    // "YYYY-MM-DD"
  toDate: string;      // "YYYY-MM-DD"
  totalDays: number;
  reason: string;
  availableOnPhone: boolean;
  alternativePhone: string | null;
  rejectionReason: string | null;
  status: string;      // Pending | Approved | Rejected | Cancelled
  approvedAt: string | null;
  approvedByName: string | null;
  createdAt: string;
}
