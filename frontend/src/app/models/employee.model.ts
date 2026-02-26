export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  departmentName: string | null;
  designationTitle: string | null;
  status: string;
  joinDate: string;
}

export interface EmployeeDetail {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  dob: string;
  gender: string;
  joinDate: string;
  status: string;
  departmentId: string | null;
  departmentName: string | null;
  designationId: string | null;
  designationTitle: string | null;
  managerId: string | null;
  managerName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEmployee {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  dob: string;
  gender: string;
  phone: string;
  joinDate: string;
  departmentId: string | null;
  designationId: string | null;
  managerId: string | null;
}

export interface UpdateEmployee {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  gender: string;
  joinDate: string;
  status: string;
  departmentId: string | null;
  designationId: string | null;
  managerId: string | null;
}

export interface EmployeeFilterParams {
  search?: string;
  departmentId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
