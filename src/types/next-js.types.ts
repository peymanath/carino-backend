export type PageProps<TParams extends {} = {}, TSearchParams extends {} = {}> = {
  params: Promise<TParams>;
  searchParams: Promise<Partial<TSearchParams>>;
};
