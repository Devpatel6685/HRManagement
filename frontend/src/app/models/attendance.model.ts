export interface BreakRecord {
  breakStart: string;       // "HH:mm:ss" (TimeOnly)
  breakEnd: string | null;
}

export interface AttendanceDto {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;             // "YYYY-MM-DD" (DateOnly)
  checkIn: string | null;   // "HH:mm:ss" (TimeOnly)
  checkOut: string | null;
  breaks: BreakRecord[];
  workHours: number | null;
  status: string;           // Present | Late | HalfDay | Absent
}

export interface MonthlyReportDto {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  totalPresent: number;
  totalLate: number;
  totalHalfDay: number;
  totalAbsent: number;
  totalWorkHours: number;
  records: AttendanceDto[];
}

export interface TeamSummaryDto {
  employeeId: string;
  employeeName: string;
  department: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  breaks: BreakRecord[];
  workHours: number | null;
}

export interface EmployeeMonthlySummaryDto {
  employeeId: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  totalPresent: number;
  totalLate: number;
  totalHalfDay: number;
  totalAbsent: number;
  totalWorkHours: number;
}
