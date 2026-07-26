type PaginationInput = {
  page?: number;
  pageSize?: number;
};

type PaginationResult = {
  skip: number;
  take: number;
};

export function extractPagination<T extends PaginationInput>(input: T): PaginationResult {
  const { page = 1, pageSize = 20 } = input;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    skip,
    take,
  };
}
