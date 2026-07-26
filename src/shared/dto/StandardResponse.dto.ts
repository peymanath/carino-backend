import { deepOmitKeys } from '../utils/deep-omit-keys.util';
import { Transform } from 'class-transformer';

export const SKIP_DATA_TRANSFORM = Symbol('SKIP_DATA_TRANSFORM');

type TransformObject = {
  [SKIP_DATA_TRANSFORM]?: boolean;
};

export class StandardResponseDto<T = unknown> {
  constructor(init?: Partial<StandardResponseDto<T>>, opts?: { skipTransform?: boolean }) {
    if (init) {
      Object.assign(this, init);
    }

    if (opts?.skipTransform) {
      Object.defineProperty(this, SKIP_DATA_TRANSFORM, {
        value: true,
        enumerable: false,
      });
    }
  }

  message?: string;

  @Transform(({ value, obj }: { value: unknown; obj: TransformObject }) => (obj?.[SKIP_DATA_TRANSFORM] ? value : deepOmitKeys(value)), {
    toPlainOnly: true,
  })
  data!: T;
}

export class PaginatedMetaDto {
  page!: number;
  pageSize!: number;
  hasNext!: boolean;
}

export class StandardPaginatedResponseDto<T = unknown> extends StandardResponseDto<T[]> {
  constructor(
    init?: {
      data: T[];
      message?: string;
      meta: PaginatedMetaDto;
    },
    opts?: {
      skipTransform?: boolean;
    }
  ) {
    super(
      {
        message: init?.message,
        data: init?.data,
      },
      opts
    );

    if (init?.meta) {
      this.meta = init.meta;
    }
  }

  meta!: PaginatedMetaDto;
}
