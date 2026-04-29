
export type QueryParams = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 1 | -1;
  skip: number;
};

export const parseQueryParams = (query: {
  pageNumber?: any;
  pageSize?: any;
  sortBy?: any;
  sortDirection?: any;
}): QueryParams => {
  const pageNumber = Math.max(parseInt(query.pageNumber) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(query.pageSize) || 10, 1),
    100,
  ); // ограничим макс. 100
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
  const sortDirection = query.sortDirection === 'asc' ? 1 : -1;

  const skip = (pageNumber - 1) * pageSize;

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    skip,
  };
};
