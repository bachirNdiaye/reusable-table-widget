import { Component, output } from '@angular/core';
import { TableAction } from '../../models/table-action.model';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  standalone: true
})
export class ContextMenuComponent {
  actionSelected = output<TableAction>();
  close = output<void>();
  actions: { key: TableAction; label: string }[] = [
    { key: 'open-local-admin', label: 'Open Local Administration UI' },
    { key: 'move-server', label: 'Move Server' },
    { key: 'connect-remote-devices', label: 'Connect Remote Services (24h)' },
    { key: 'advanced-debug', label: 'Advanced Debug Mode' },
  ];
  onAction(action: TableAction) {
    this.actionSelected.emit(action);
  }
  onClose() {
    this.close.emit();
  }
}
