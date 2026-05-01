import { StandardPaginatedResponseDto } from "@/shared/dto";
import { IPaginationMeta } from "@/shared/interfaces/pagination-meta.interface";

export async function paginateSlice<T>({ page = 1, pageSize = 20 }: IPaginationMeta, fetcher: (args: { skip: number; take: number }) => Promise<T[]>): Promise<StandardPaginatedResponseDto<T>> {
  const p = Math.max(1, Number(page));
  const size = Math.max(1, Number(pageSize));
  const skip = (p - 1) * size;

  const rows = await fetcher({ skip, take: size + 1 });
  const hasNext = rows.length > size;
  const data = hasNext ? rows.slice(0, size) : rows;

  return {
    data,
    meta: {
      page: p,
      pageSize: size,
      hasNext
    }
  };
}
