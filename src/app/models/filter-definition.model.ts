export type FilterType = 'search' | 'multiselect' | 'daterange' | 'radiobuttons';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  emphasized: boolean;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;
  hasSearch: boolean;
  disabled: boolean;
  visible: boolean;
  options?: FilterOption[];
}
