export interface PackageRef {
  id: string;
}

export interface VideoReviewItem {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  package: PackageRef;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VideoReviewResponse {
  success: boolean;
  count: number;
  data: VideoReviewItem[];
}
