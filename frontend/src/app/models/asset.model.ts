export interface AssetDto {
  id: string;
  assetName: string;
  assetCode: string;
  category: string;
  status: 'Available' | 'Assigned' | 'UnderMaintenance' | 'Retired';
  assignedToEmployeeId: string | null;
  assignedToEmployeeName: string | null;
  assignedDate: string | null;
  returnDate: string | null;
}

export interface CreateAssetDto {
  assetName: string;
  assetCode: string;
  category: string;
}

export interface UpdateAssetDto {
  assetName: string;
  category: string;
}

export interface AssignAssetDto {
  employeeId: string;
}
