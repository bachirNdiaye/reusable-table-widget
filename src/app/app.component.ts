import { Component } from '@angular/core';
import { TableWidgetComponent } from './components/table-widget/table-widget.component';

@Component({
  selector: 'app-root',
  imports: [TableWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {

}
