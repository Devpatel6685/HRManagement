export interface JobPostingDto {
  id: string;
  title: string;
  departmentId: string;
  department: string;
  description: string;
  requirements: string | null;
  openings: number;
  status: 'Open' | 'Closed' | 'OnHold';
  postedOn: string;
  closedOn: string | null;
  applicantCount: number;
}

export interface CreateJobPostingDto {
  title: string;
  departmentId: string;
  description: string;
  requirements: string;
  openings: number;
}

export interface UpdateJobPostingDto extends CreateJobPostingDto {
  status: string;
}

export interface ApplicantDto {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string | null;
  resumeFileName: string | null;
  hasResume: boolean;
  status: ApplicantStatus;
  appliedOn: string;
  notes: string | null;
}

export type ApplicantStatus =
  | 'Applied' | 'Shortlisted' | 'Interviewed'
  | 'Offered' | 'Hired' | 'Rejected';

export interface KanbanBoardDto {
  applied: ApplicantDto[];
  shortlisted: ApplicantDto[];
  interviewed: ApplicantDto[];
  offered: ApplicantDto[];
  hired: ApplicantDto[];
  rejected: ApplicantDto[];
}

export interface UpdateApplicantStatusDto {
  status: string;
  notes?: string;
}
