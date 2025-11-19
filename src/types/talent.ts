export interface ITalentProfile {
  id?: number;
  talentId: number;
  keywords: string[];
  skills: string[];
  experience?: string;
  education?: string;
}

export interface ITalentProfileCreate extends ITalentProfile {
  talentId: number;
}

export interface ITalentProfileUpdate extends Partial<ITalentProfile> {
  id: number;
}

export interface ITalentCV {
  id?: number;
  talentId: number;
  fileUrl: string;
  fileName: string;
  version?: number;
}

export interface ITalentCVCreate extends ITalentCV {
  talentId: number;
  fileUrl: string;
  fileName: string;
}

