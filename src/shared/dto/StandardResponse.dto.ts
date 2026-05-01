import { deepOmitKeys } from "@/shared/utils/deep-omit-keys.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export const SKIP_DATA_TRANSFORM = Symbol("SKIP_DATA_TRANSFORM");


export class StandardResponseDto<T = unknown> {
  constructor(init?: Partial<StandardResponseDto<T>>, opts?: { skipTransform?: boolean }) {
    if (init) Object.assign(this, init);
    if (opts?.skipTransform) (this as any).SKIP_DATA_TRANSFORM = true;
  }

  @ApiProperty({
    example: "عملیات با موفقیت انجام شد",
    required: false,
    description: "A human-readable message describing the outcome."
  })
  message?: string;

  @ApiProperty({
    description: "The primary content of the response.",
    type: Object
  })
  @Transform(({ value, obj }) => (obj?.SKIP_DATA_TRANSFORM ?  value : deepOmitKeys(value)), { toPlainOnly: true, })
  data!: T;
}


export class PaginatedMetaDto<T = any> {
  @ApiProperty({
    example: 1,
    description: "The current page number."
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: "The number of items per page."
  })
  pageSize!: number;

  @ApiProperty({
    example: true,
    description: "The total number of items across all pages."
  })
  hasNext: boolean;
}

export class StandardPaginatedResponseDto<T = any> extends StandardResponseDto<T[]> {
  constructor(init?: { data: T[]; message?: string; meta: PaginatedMetaDto<T> }, opts?: { skipTransform?: boolean }) {
    super({ message: init?.message, data: init?.data }, opts);
    if (init?.meta) this.meta = init.meta;
  }

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto<T>;
}
