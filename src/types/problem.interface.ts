export interface Problem {
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
