import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../service/theme.service';
import { AuthenticationService } from '../../service/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  constructor(
    protected themeService: ThemeService,
    protected authService: AuthenticationService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}
  currentTheme!: string;

  logout(): void {
    this.authService.logout();
  }

  isDetailsRoute(): boolean {
    return this.route.snapshot.url[0]?.path === 'details';
  }

  getDetailsLink(): string {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? `/excursions/details/${id}` : '';
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getPreferredTheme();
    this.listenToSystemChanges();
  }

  private listenToSystemChanges(): void {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.themeService.getStoredTheme() === 'system') {
          this.currentTheme = this.themeService.getPreferredTheme();
        }
      });
  }
}
