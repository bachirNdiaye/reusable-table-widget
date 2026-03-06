import { computed, Injectable, Signal } from '@angular/core';
import { signal } from '@angular/core';
import { Server } from '../models/server.model';
import { MOCK_SERVERS } from '../data/mock-servers';
import { DateRange, SortDirection } from '../models/table-query.model';
import { FilterDefinition, FilterOption } from '../models/filter-definition.model';

@Injectable({
  providedIn: 'root'
})
export class TableStateService {
  readonly servers = signal<Server[]>(MOCK_SERVERS);
  readonly sorting = signal<{ column: string; direction: SortDirection }>({ column: 'name', direction: 'asc' });
  readonly selectedRowsIds = signal<Set<string>>(new Set());
  readonly pagination = signal<{ page: number; pageSize: number }>({ page: 1, pageSize: 10 });
  readonly visibleColumns = signal<string[]>(['serial', 'name', 'assetName', 'version', 'serverType', 'license', 'hardware', 'status', 'warningsCount', 'lastCommDate']);
  readonly search = signal<string>('');
  readonly statusFilter = signal<string[]>([]);
  readonly assetFilter = signal<string[]>([]);
  readonly typeFilter = signal<string[]>([]);
  readonly licenseFilter = signal<string[]>([]);
  readonly hardwareFilter = signal<string[]>([]);
  readonly lastUpdatedFilter = signal<DateRange | null>(null);
  readonly searchHistory = signal<string[]>([]);
  readonly filterVisibility = signal<{ [key: string]: boolean }>({});

  constructor() { }

  private buildFilterOptions(servers: Server[], field: keyof Server): FilterOption[] {
    const values = Array.from(new Set(servers.map(s => s[field] as string)));
    return values.map(val => ({
      value: val,
      label: val,
      count: servers.filter(s => s[field] === val).length,
      emphasized: false
    }));
  }

  filteredServers = computed(() => {
    let result = this.servers();
    const search = this.search().toLowerCase().trim();
    const statuses = this.statusFilter();
    const assets = this.assetFilter();
    const types = this.typeFilter();
    const licenses = this.licenseFilter();
    const hardwares = this.hardwareFilter();
    const lastUpdated = this.lastUpdatedFilter();
    const sorting = this.sorting();

    if (search.trim()) {
      result = result.filter(server =>
        server.name.toLowerCase().includes(search)
        || server.serial.toLowerCase().includes(search)
        || server.version.toLowerCase().includes(search)
      );
    }

    if (statuses.length) result = result.filter(server => statuses.includes(server.status));
    if (assets.length) result = result.filter(server => assets.includes(server.assetName));
    if (types.length) result = result.filter(server => types.includes(server.serverType));
    if (licenses.length) result = result.filter(server => licenses.includes(server.license));
    if (hardwares.length) result = result.filter(server => hardwares.includes(server.hardware));

    if (lastUpdated) {
      result = result.filter(server => {
        return server.lastCommDate >= lastUpdated.startDate && server.lastCommDate <= lastUpdated.endDate;
      });
    }

    if (sorting.column && sorting.direction) {
      result = [...result].sort((a, b) => {
        const aVal = a[sorting.column as keyof Server];
        const bVal = b[sorting.column as keyof Server];

        if (aVal instanceof Date && bVal instanceof Date) {
          return sorting.direction === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sorting.direction === 'asc'
            ? aVal - bVal
            : bVal - aVal;
        }

        return sorting.direction === 'asc'
          ? String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
          : String(bVal).toLowerCase().localeCompare(String(aVal).toLowerCase());
      });
    }

    return result;
  });

  paginatedServers = computed(() => {
    const filtered = this.filteredServers();
    const pagination = this.pagination();
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return filtered.slice(startIndex, startIndex + pagination.pageSize);
  });

  totalCount = computed(() => this.filteredServers().length);

  hasActiveFilters = computed(() => {
    return this.search().trim() ||
      this.statusFilter().length ||
      this.assetFilter().length ||
      this.typeFilter().length ||
      this.licenseFilter().length ||
      this.hardwareFilter().length ||
      this.lastUpdatedFilter() !== null;
  });

  activeFiltersCount = computed(() => {
    return {
      statusFilterCount: this.statusFilter().length,
      assetFilterCount: this.assetFilter().length,
      typeFilterCount: this.typeFilter().length,
      licenseFilterCount: this.licenseFilter().length,
      hardwareFilterCount: this.hardwareFilter().length
    }
  });

  filterDefinitions: Signal<FilterDefinition[]> = computed(() => {
    const servers = this.servers();

    const statusOptions = this.buildFilterOptions(servers, 'status').map(opt => ({
      ...opt,
      emphasized: opt.value === 'warning' && servers.some(s => s.status === 'warning' && s.warningsCount > 1)
    }));
    const assetOptions = this.buildFilterOptions(servers, 'assetName');
    const typeOptions = this.buildFilterOptions(servers, 'serverType');
    const licenseOptions = this.buildFilterOptions(servers, 'license');
    const hardwareOptions = this.buildFilterOptions(servers, 'hardware');

    return [
      {
        key: 'status',
        label: 'Status',
        type: 'multiselect',
        hasSearch: false,
        disabled: statusOptions.length <= 1,
        visible: true,
        options: statusOptions
      }, {
        key: 'asset',
        label: 'Asset',
        type: 'multiselect',
        hasSearch: true,
        disabled: assetOptions.length <= 1,
        visible: true,
        options: assetOptions
      }, {
        key: 'type',
        label: 'Type',
        type: 'multiselect',
        hasSearch: false,
        disabled: typeOptions.length <= 1,
        visible: true,
        options: typeOptions
      }, {
        key: 'license',
        label: 'License',
        type: 'multiselect',
        hasSearch: false,
        disabled: licenseOptions.length <= 1,
        visible: true,
        options: licenseOptions
      }, {
        key: 'hardware',
        label: 'Hardware',
        type: 'multiselect',
        hasSearch: false,
        disabled: hardwareOptions.length <= 1,
        visible: true,
        options: hardwareOptions
      }
    ];
  });

  setSearch(value: string) {
    this.search.set(value);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  addSearchTerm(term: string) {
    this.searchHistory.update(history => {
      const newHistory = [term, ...history.filter(t => t !== term)];
      return newHistory.slice(0, 3);
    });
  }

  setStatusFilter(values: string[]) {
    this.statusFilter.set(values);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setAssetFilter(values: string[]) {
    this.assetFilter.set(values);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setTypeFilter(values: string[]) {
    this.typeFilter.set(values);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setLicenseFilter(values: string[]) {
    this.licenseFilter.set(values);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setHardwareFilter(values: string[]) {
    this.hardwareFilter.set(values);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setLastUpdatedFilter(value: DateRange | null) {
    this.lastUpdatedFilter.set(value);
    this.pagination.update(() => ({ ...this.pagination(), page: 1 }));
  }

  setSorting(column: string, direction: SortDirection) {
    this.sorting.set({ column, direction });
  }

  setPage(page: number) {
    this.pagination.update(pagination => ({ ...pagination, page }));
  }

  setPageSize(pageSize: number) {
    this.pagination.update(pagination => ({ ...pagination, pageSize, page: 1 }));
  }

  toggleRowSelection(rowId: string) {
    this.selectedRowsIds.update(selected => {
      const newSelected = new Set(selected);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
      return newSelected;
    });
  }

  selectAllOnPage() {
    // console.log('Selecting all on page');
    const currentPageIds = this.paginatedServers().map(server => server.id);
    this.selectedRowsIds.update(selected => {
      const newSelected = new Set(selected);
      currentPageIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
  }

  clearSelection() {
    // console.log('Clearing selection');
    this.selectedRowsIds.update(() => new Set());
  }

  clearAllFilters() {
    this.setSearch('');
    this.setStatusFilter([]);
    this.setAssetFilter([]);
    this.setTypeFilter([]);
    this.setLicenseFilter([]);
    this.setHardwareFilter([]);
    this.setLastUpdatedFilter(null);
  }

  reorderColumns(fromIndex: number, toIndex: number) {
    this.visibleColumns.update(columns => {
      const newColumns = [...columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return newColumns;
    });
  }

  updateServerName(serverId: string, newName: string) {
    this.servers.update(servers => {
      return servers.map(server => {
        if (server.id === serverId) {
          return { ...server, name: newName };
        }
        return server;
      });
    });
  }

  toggleFilterVisibility(filterKey: string) {
    this.filterVisibility.update(visibility => {
      return { ...visibility, [filterKey]: !visibility[filterKey] };
    });
  }
}
