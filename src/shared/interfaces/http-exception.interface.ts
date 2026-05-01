import { ProblemDetailsDto } from "../dto/ProblemDetails.dto";

export type ProblemDetails = {
  [K in keyof ProblemDetailsDto]: ProblemDetailsDto[K];
};
