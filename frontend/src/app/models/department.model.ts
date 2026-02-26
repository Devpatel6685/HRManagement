export interface Department {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  title: string;
  departmentId: string;
  level: number;
}

export interface DepartmentListItem {
  id: string;
  name: string;
  headEmployeeName: string | null;
  employeeCount: number;
}

export interface DepartmentDetail {
  id: string;
  name: string;
  headEmployeeId: string | null;
  headEmployeeName: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDepartment {
  name: string;
  headEmployeeId: string | null;
}

export interface UpdateDepartment {
  name: string;
  headEmployeeId: string | null;
}

export interface DesignationListItem {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  level: number;
  levelLabel: string;
  employeeCount: number;
}

export interface CreateDesignation {
  title: string;
  departmentId: string;
  level: number;
}

export interface UpdateDesignation {
  title: string;
  departmentId: string;
  level: number;
}
