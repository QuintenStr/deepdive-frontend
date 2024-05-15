import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private active: boolean = false;

  show(): void {
    this.active = true;
  }

  hide(): void {
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }
}
