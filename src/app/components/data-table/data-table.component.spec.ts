import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { TableStateService } from '../../store/table-state.service';

describe('Component tests', () => {
  let store: TableStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent, FilterBarComponent]
    }).compileComponents();

    store = TestBed.inject(TableStateService);
  });

  it('contextual action should apply to multiple selected rows', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const servers = store.paginatedServers();
    store.toggleRowSelection(servers[0].id);
    store.toggleRowSelection(servers[1].id);
    store.toggleRowSelection(servers[2].id);
    component.hoveredRowId.set(servers[0].id);

    spyOn(console, 'log');
    component.onAction('move-server');

    const event = (console.log as jasmine.Spy).calls.mostRecent().args[1];
    expect(event.targetRows.length).toBe(3);
  });

  it('More Filters should toggle visibility of filters', () => {
    store.toggleFilterVisibility('status');
    expect(store.filterVisibility()['status']).toBeTrue();

    store.toggleFilterVisibility('status');
    expect(store.filterVisibility()['status']).toBeFalse();
  });

  it('custom date range should filter servers by date', () => {
    const totalBefore = store.filteredServers().length;

    store.setLastUpdatedFilter({
      startDate: new Date('2026-03-04'),
      endDate: new Date('2026-03-05')
    });

    const totalAfter = store.filteredServers().length;
    expect(totalAfter).toBeLessThan(totalBefore);
    expect(store.filteredServers().every(s =>
      s.lastCommDate >= new Date('2026-03-04') && s.lastCommDate <= new Date('2026-03-05')
    )).toBeTrue();
  });
});
