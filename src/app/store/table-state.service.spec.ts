import { TestBed } from '@angular/core/testing';

import { TableStateService } from './table-state.service';

describe('TableStateService', () => {
  let store: TableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TableStateService);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('filter state', () => {
    it('should filter servers by search term', () => {
      store.setSearch('web-prod');
      const results = store.filteredServers();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(s =>
        s.name.toLowerCase().includes('web-prod')
        || s.serial.toLowerCase().includes('web-prod')
        || s.version.toLowerCase().includes('web-prod')
      )).toBeTrue();
    });

    it('should filter servers by status', () => {
      store.setStatusFilter(['online']);
      const results = store.filteredServers();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(s => s.status === 'online')).toBeTrue();
    });

    it('should combine filters with AND logic', () => {
      store.setSearch('web');
      store.setStatusFilter(['online']);
      const results = store.filteredServers();
      results.forEach(s => {
        expect(s.status).toBe('online');
        expect(
          s.name.toLowerCase().includes('web')
          || s.serial.toLowerCase().includes('web')
          || s.version.toLowerCase().includes('web')
        ).toBeTrue();
      });
    });

    it('should reset page to 1 when a filter changes', () => {
      store.setPage(3);
      expect(store.pagination().page).toBe(3);

      store.setSearch('test');
      expect(store.pagination().page).toBe(1);
    });

    it('should update bubble count when selecting filters', () => {
      store.setStatusFilter(['online', 'offline']);
      expect(store.activeFiltersCount().statusFilterCount).toBe(2);

      store.setAssetFilter(['DC-Paris']);
      expect(store.activeFiltersCount().assetFilterCount).toBe(1);
    });

    it('should report hasActiveFilters correctly', () => {
      expect(store.hasActiveFilters()).toBeFalsy();

      store.setStatusFilter(['online']);
      expect(store.hasActiveFilters()).toBeTruthy();
    });

    it('should reset everything on clearAllFilters', () => {
      store.setSearch('test');
      store.setStatusFilter(['online']);
      store.setAssetFilter(['DC-Paris']);
      store.setTypeFilter(['Web']);

      store.clearAllFilters();

      expect(store.search()).toBe('');
      expect(store.statusFilter()).toEqual([]);
      expect(store.assetFilter()).toEqual([]);
      expect(store.typeFilter()).toEqual([]);
      expect(store.hasActiveFilters()).toBeFalsy();
    });
  });

  describe('search history', () => {
    it('should keep last 3 unique terms', () => {
      store.addSearchTerm('alpha');
      store.addSearchTerm('beta');
      store.addSearchTerm('gamma');
      store.addSearchTerm('delta');

      expect(store.searchHistory().length).toBe(3);
      expect(store.searchHistory()).toEqual(['delta', 'gamma', 'beta']);
    });

    it('should move duplicate term to the front', () => {
      store.addSearchTerm('alpha');
      store.addSearchTerm('beta');
      store.addSearchTerm('alpha');

      expect(store.searchHistory().length).toBe(2);
      expect(store.searchHistory()[0]).toBe('alpha');
    });
  });

  describe('warning display rule', () => {
    it('should mark warning option as emphasized when warningsCount > 1 exists', () => {
      const definitions = store.filterDefinitions();
      const statusFilter = definitions.find(f => f.key === 'status');
      const warningOption = statusFilter?.options?.find(o => o.value === 'warning');

      expect(warningOption).toBeTruthy();
      expect(warningOption!.emphasized).toBeTrue();
    });
  });

  describe('column reordering', () => {
    it('should move a column from one position to another', () => {
      const original = [...store.visibleColumns()];
      const movedCol = original[0];

      store.reorderColumns(0, 2);

      const updated = store.visibleColumns();
      expect(updated[0]).not.toBe(movedCol);
      expect(updated[2]).toBe(movedCol);
      expect(updated.length).toBe(original.length);
    });
  });

  describe('inline editing', () => {
    it('should update server name', () => {
      const server = store.servers()[0];
      const oldName = server.name;

      store.updateServerName(server.id, 'new-server-name');

      const updated = store.servers().find(s => s.id === server.id);
      expect(updated!.name).toBe('new-server-name');
      expect(updated!.name).not.toBe(oldName);
    });

    it('should not affect other servers when renaming', () => {
      const servers = store.servers();
      const target = servers[0];
      const other = servers[1];

      store.updateServerName(target.id, 'renamed');

      const otherAfter = store.servers().find(s => s.id === other.id);
      expect(otherAfter!.name).toBe(other.name);
    });
  });

  describe('filter disabled rule', () => {
    it('should disable filter when only one option exists', () => {
      store.servers.set([
        { id: '1', serial: 'SN-1', name: 'srv-1', assetName: 'DC-Paris', version: '1.0', serverType: 'Web', license: 'Enterprise', hardware: 'Dell', status: 'online', warningsCount: 0, lastCommDate: new Date() },
        { id: '2', serial: 'SN-2', name: 'srv-2', assetName: 'DC-Paris', version: '1.0', serverType: 'Web', license: 'Enterprise', hardware: 'Dell', status: 'online', warningsCount: 0, lastCommDate: new Date() },
      ]);

      const definitions = store.filterDefinitions();
      const typeFilter = definitions.find(f => f.key === 'type');
      expect(typeFilter!.disabled).toBeTrue();
    });
  });
});
