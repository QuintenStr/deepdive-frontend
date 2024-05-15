import { Component } from '@angular/core';
import { LoadingService } from '../../service/loading.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  animations: [
    trigger('fadeInOverlay', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out')),
    ]),
  ],
})
export class LoaderComponent {
  constructor(protected loader: LoadingService, private theme: ThemeService) {}

  get isLoading(): boolean {
    return this.loader.isActive();
  }
}
