export interface IPosition {
  id?: number;
  title: string;
  description: string;
  requirements: string[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  clientId: number;
  status?: 'draft' | 'published' | 'closed';
  keywords: string[];
}

export interface IPositionCreate extends IPosition {
  clientId: number;
}

export interface IPositionUpdate extends Partial<IPosition> {
  id: number;
}

