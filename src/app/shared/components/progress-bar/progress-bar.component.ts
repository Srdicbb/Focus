import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      <div
        [class]="fillClass"
        [style.width.%]="value"
        [style.transition]="'width 0.7s ease-out'"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent implements OnChanges {
  @Input() value = 0;
  @Input() size: 'sm' | 'lg' = 'sm';

  containerClass = '';
  fillClass = '';

  ngOnChanges(): void {
    this.containerClass = `w-full rounded-full overflow-hidden bg-secondary ${this.size === 'lg' ? 'h-4' : 'h-2'}`;
    const color = this.value >= 100 ? 'bg-success' : 'bg-accent';
    this.fillClass = `h-full rounded-full ${color}`;
  }
}
