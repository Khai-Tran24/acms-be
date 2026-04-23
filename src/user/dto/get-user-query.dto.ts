export class GetUserQueryDto {
  search?: string;
  sortBy?: 'username' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
