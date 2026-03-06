import { Component, computed, inject, signal } from '@angular/core';
import { TableStateService } from '../../store/table-state.service';
import { Server } from '../../models/server.model';
import { TableAction, TableActionEvent } from '../../models/table-action.model';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-data-table',
  imports: [DatePipe, CdkDropList, CdkDrag, CdkDragHandle, ContextMenuComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  standalone: true
})
export class DataTableComponent {
  readonly store = inject(TableStateService);

  hoveredRowId = signal<string | null>(null);

  editingCell = signal<{ rowId: string; column: string } | null>(null);

  editValue = signal<string>('');

  contextMenuRowId = signal<string | null>(null);

  onRowHover(id: string | null) {
    this.hoveredRowId.set(id);
  }

  onSort(column: string) {
    const currentSorting = this.store.sorting();

    if (currentSorting.column === column) {
      this.store.setSorting(column, currentSorting.direction === 'asc' ? 'desc' : 'asc');
    } else {
      this.store.setSorting(column, 'asc');
    }
  }

  startEditing(rowId: string, column: string, currentValue: string) {
    this.editingCell.set({ rowId, column });
    this.editValue.set(currentValue);
  }

  saveEdit() {
    const cell = this.editingCell();
    if (!cell) return;

    const editValue = this.editValue().trim();
    if (editValue) this.store.updateServerName(cell.rowId, editValue);
  }

  cancelEdit() {
    this.editingCell.set(null);
    this.editValue.set('');
  }

  onEditKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.saveEdit();

      const editing = this.editingCell();

      if (!editing) return;

      const editableColumns = ['name', 'assetName'] // so we can add more in the future. I added assetName to be able to test moving to the next cell in the same row
      const currentIndex = editableColumns.indexOf(editing.column);
      const nextIndex = currentIndex + 1;

      if (nextIndex < editableColumns.length) {
        const nextColumn = editableColumns[nextIndex];
        const server = this.store.paginatedServers().find(s => s.id === editing.rowId);

        if (server) {
          this.startEditing(editing.rowId, nextColumn, server[nextColumn as keyof Server] as string);
        }
      }
    }
  }

  toggleContextMenu(rowId: string) {
    this.contextMenuRowId.set(this.contextMenuRowId() === rowId ? null : rowId);
  }

  closeContextMenu() {
    this.contextMenuRowId.set(null);
  }

  onAction(action: TableAction | any) {
    const servers = this.store.servers();
    const selectedIds = this.store.selectedRowsIds();
    const hoveredId = this.hoveredRowId();

    const targetRows = selectedIds.size > 0
      ? servers.filter(s => selectedIds.has(s.id))
      : servers.filter(s => s.id === hoveredId);

    const event: TableActionEvent = { action, targetRows };
    console.log('Action triggered:', event);

    this.contextMenuRowId.set(null);
  }

  isSelected(id: string) {
    return this.store.selectedRowsIds().has(id);
  }

  isAllOnPageSelected = computed(() => {
    const pageIds = this.store.paginatedServers().map(s => s.id);
    const selected = this.store.selectedRowsIds();
    return pageIds.length > 0 && pageIds.every(id => selected.has(id));
  });

  toggleSelectAll(): void {
    if (this.isAllOnPageSelected()) {
      this.store.clearSelection();
    } else {
      this.store.selectAllOnPage();
    }
  }

  totalPages = computed(() =>
    Math.ceil(this.store.totalCount() / this.store.pagination().pageSize)
  );

  onColumnDrop(event: any): void {
    this.store.reorderColumns(event.previousIndex, event.currentIndex);
  }
}
