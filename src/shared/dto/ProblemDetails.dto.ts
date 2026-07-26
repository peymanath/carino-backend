export class ProblemDetailsDto {
  title!: string;
  status!: number;
  detail!: string;
  errors?: Record<string, string[]>;
}
