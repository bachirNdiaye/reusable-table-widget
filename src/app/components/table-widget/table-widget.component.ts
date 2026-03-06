import { Component } from '@angular/core';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { DataTableComponent } from '../data-table/data-table.component';

@Component({
  selector: 'app-table-widget',
  imports: [FilterBarComponent, DataTableComponent],
  templateUrl: './table-widget.component.html',
  styleUrl: './table-widget.component.scss',
  standalone: true
})
export class TableWidgetComponent {

}
