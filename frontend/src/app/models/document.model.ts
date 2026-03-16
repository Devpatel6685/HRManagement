export interface DocumentDto {
  id: string;
  employeeId: string;
  docType: string;
  fileName: string;
  fileSize: number;
  employeeName: string | null;
  uploadedByName: string | null;
  uploadedOn: string;
}
