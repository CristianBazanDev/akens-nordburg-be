export interface IProcessStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  cancelled: number;
}

export interface IRecruiterStats {
  recruiterId: number;
  recruiterName: string;
  openProcesses: number;
  closedProcesses: number;
  totalProcesses: number;
}

export interface IMonthlyGoal {
  id?: number;
  month: number;
  year: number;
  targetProcesses: number;
  targetHires: number;
  actualProcesses?: number;
  actualHires?: number;
}

export interface IAnnualGoal {
  id?: number;
  year: number;
  targetProcesses: number;
  targetHires: number;
  actualProcesses?: number;
  actualHires?: number;
}

export interface IAdminDashboardStats {
  processStats: IProcessStats;
  recruiterStats: IRecruiterStats[];
  monthlyGoals: IMonthlyGoal[];
  annualGoals: IAnnualGoal[];
  topRecruiters: IRecruiterStats[];
  recentProcesses: any[];
}

