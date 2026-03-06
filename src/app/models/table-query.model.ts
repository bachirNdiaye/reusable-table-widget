export type SortDirection = 'asc' | 'desc';

export interface TableSorting {
  column: string;
  direction: SortDirection;
}

export interface TablePagination {
  page: number;
  pageSize: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TableQuery {
  search: string;
  status: string[];
  asset: string[];
  type: string[];
  license: string[];
  hardware: string[];
  lastUpdated: DateRange | null;
  sorting: string[];
  pagination: string[];
  visibleColumns: string[];
}
