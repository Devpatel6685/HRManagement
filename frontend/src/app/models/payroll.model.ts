export interface EmployeePayrollInput {
  employeeId: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
}

export interface GeneratePayrollDto {
  month: number;
  year: number;
  employees: EmployeePayrollInput[];
}

export interface GeneratePayrollResultDto {
  generated: number;
  skipped: number;
  errors: string[];
}

export interface PayrollDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;       // Generated | Paid
  paidOn: string | null;
  generatedOn: string;
}
