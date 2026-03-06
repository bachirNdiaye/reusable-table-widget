import { Component, inject, signal, computed } from '@angular/core';
import { TableStateService } from '../../store/table-state.service';
import { FilterDefinition } from '../../models/filter-definition.model';
import { FormsModule } from '@angular/forms';
import { DateRange } from '../../models/table-query.model';

@Component({
  selector: 'app-filter-bar',
  imports: [FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  standalone: true
})
export class FilterBarComponent {
  readonly store = inject(TableStateService);
  openDropdown = signal<string | null>(null);
  assetSearchInput = signal('');
  lastUpdatedPreset = signal<string | null>(null);
  customDateStart = signal('');
  customDateEnd = signal('');
  moreFiltersOpen = signal(false);

  filteredAssetOptions = computed(() => {
    const def = this.store.filterDefinitions().find(f => f.key === 'asset');
    if (!def) return [];
    const search = this.assetSearchInput().toLowerCase();
    if (!search) return def.options;
    return def?.options?.filter(o => o.label.toLowerCase().includes(search));
  });

  toggleDropdown(key: string) {
    this.openDropdown.set(this.openDropdown() === key ? null : key);
  }

  onSearchInput(term: string) {
    this.store.setSearch(term);
    if (term.trim()) {
      this.store.addSearchTerm(term.trim());
    }
  }

  applyRecentTerm(term: string) {
    this.store.setSearch(term);
  }

  toggleFilterValue(filterKey: string, value: string) {
    const current = this.getFilterValues(filterKey);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    this.applyFilter(filterKey, updated);
  }

  getFilterValues(key: string): string[] {
    switch (key) {
      case 'status': return this.store.statusFilter();
      case 'asset': return this.store.assetFilter();
      case 'type': return this.store.typeFilter();
      case 'license': return this.store.licenseFilter();
      case 'hardware': return this.store.hardwareFilter();
      default: return [];
    }
  }

  applyFilter(key: string, values: string[]) {
    switch (key) {
      case 'status': this.store.setStatusFilter(values); break;
      case 'asset': this.store.setAssetFilter(values); break;
      case 'type': this.store.setTypeFilter(values); break;
      case 'license': this.store.setLicenseFilter(values); break;
      case 'hardware': this.store.setHardwareFilter(values); break;
    }
  }

  onLastUpdatedPreset(preset: string) {
    this.lastUpdatedPreset.set(preset);
    const now = new Date();
    let start: Date;
    switch (preset) {
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        return;
      default:
        return;
    }
    this.store.setLastUpdatedFilter({ startDate: start, endDate: now });
  }

  applyCustomDateRange() {
    const start = this.customDateStart();
    const end = this.customDateEnd();
    if (!start || !end) return;
    this.store.setLastUpdatedFilter({
      startDate: new Date(start),
      endDate: new Date(end)
    });
  }

  toggleMoreFilters() {
    this.moreFiltersOpen.set(!this.moreFiltersOpen());
  }

  clearAll() {
    this.store.clearAllFilters();
    this.openDropdown.set(null);
    this.lastUpdatedPreset.set(null);
    this.customDateStart.set('');
    this.customDateEnd.set('');
  }
}
