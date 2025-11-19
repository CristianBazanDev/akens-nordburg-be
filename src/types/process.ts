export interface IProcess {
  id?: number;
  title: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed' | 'cancelled';
  positionId: number;
  recruiterId: number;
  clientId: number;
  stages?: IProcessStage[];
}

export interface IProcessCreate extends IProcess {
  positionId: number;
  recruiterId: number;
  clientId: number;
  stages?: IProcessStageCreate[];
}

export interface IProcessUpdate extends Partial<IProcess> {
  id: number;
}

export interface IProcessStage {
  id?: number;
  name: string;
  order: number;
  processId?: number;
}

export interface IProcessStageCreate {
  name: string;
  order: number;
}

export interface IProcessCandidate {
  id?: number;
  processId: number;
  talentId: number;
  stageId: number;
  status?: 'pending' | 'approved' | 'rejected' | 'in_review';
  notes?: string;
}

export interface IProcessCandidateCreate extends IProcessCandidate {
  processId: number;
  talentId: number;
  stageId: number;
}

export interface IProcessCandidateUpdate extends Partial<IProcessCandidate> {
  id: number;
}

