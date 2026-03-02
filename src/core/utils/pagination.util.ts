import { Filter, SortDirection } from 'mongodb';
import { parseQueryParams } from './query-parser.util';

export async function findPaginated<T>(
  collection: {
    find: (filter: Filter<T>) => any;
    countDocuments: (filter: Filter<T>) => Promise<number>;
  },
  filter: Filter<T>,
  query: {
    pageNumber?: any;
    pageSize?: any;
    sortBy?: any;
    sortDirection?: any;
  },
) {
  const { pageNumber, pageSize, sortBy, sortDirection, skip } =
    parseQueryParams(query);

  const [items, totalCount] = await Promise.all([
    collection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items,
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize,
    totalCount,
  };
}
