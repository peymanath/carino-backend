import { ApiProperty } from "@nestjs/swagger";

export class ProblemDetailsDto {
  @ApiProperty({
    description: "A short, human-readable summary of the problem type.",
    example: "Bad Request" 
  })
  title!: string;

  @ApiProperty({
    description: "The HTTP status code for this occurrence of the problem.",
    example: 400
  })
  status!: number;

  @ApiProperty({
    description: "A detailed message explaining the error.",
    example: "مشکلی رخ داده"
  })
  detail!: string;

  @ApiProperty({
    description: "Optional object containing validation errors for specific fields.",
    type: Object,
    required: false,
    example: { mobile: ["شماره موبایل الزامی است."] }
  })
  errors?: Record<string, string[]>;
}
