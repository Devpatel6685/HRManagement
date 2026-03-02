export interface PerformanceReviewDto {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: string;
  rating: number;
  comments: string | null;
  strengths: string | null;
  improvements: string | null;
  reviewDate: string;
}

export interface AddReviewDto {
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  comments: string | null;
  strengths: string | null;
  improvements: string | null;
}

export interface AverageRatingDto {
  employeeId: string;
  employeeName: string;
  averageRating: number;
  reviewCount: number;
}
