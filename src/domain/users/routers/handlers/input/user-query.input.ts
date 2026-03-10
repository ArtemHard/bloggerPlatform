import { PaginationAndSorting } from "../../../../../core/types/pagination-and-sorting";
import { UserSortField } from "./user-sort-field";

export type UsersQueryFieldsType = PaginationAndSorting<UserSortField> &
  Partial<{
    searchLoginTerm: string;
    searchEmailTerm: string;
  }>;