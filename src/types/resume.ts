export interface Resume {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

export interface ResumeState {
  data: Resume | null;
  loading: boolean;
  error: string | null;
}