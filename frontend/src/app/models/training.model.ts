export interface TrainingDto {
  id: string;
  title: string;
  description: string;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  trainer: string;
  maxParticipants: number;
  enrolledCount: number;
  createdAt: string;
}

export interface CreateTrainingDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  trainer: string;
  maxParticipants: number;
}

export interface EmployeeTrainingDto {
  id: string;
  trainingId: string;
  trainingTitle: string;
  startDate: string;
  endDate: string;
  trainer: string;
  employeeId: string;
  employeeName: string;
  status: string;
  completionDate: string | null;
  score: number | null;
}

export interface AssignEmployeesDto {
  employeeIds: string[];
}

export interface MarkCompletedDto {
  score: number | null;
}
