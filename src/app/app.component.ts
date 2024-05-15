import { Component, OnInit } from '@angular/core';
import { ThemeService } from './shared/service/theme.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'deepdive';

  constructor(
    private themeService: ThemeService,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        this.translate
          .get(event['title'])
          .subscribe((translatedTitle: string) => {
            this.titleService.setTitle(translatedTitle + ' - DeepDive');
          });
      });

    translate.setDefaultLang('en');
    this.loadLanguage();
  }

  loadLanguage() {
    const browserLang = this.translate.getBrowserLang() || 'en';
    const lang = localStorage.getItem('lang') || browserLang;
    this.translate.use(lang);
  }

  ngOnInit() {
    this.applyPreferredTheme();
  }

  applyPreferredTheme(): void {
    const preferredTheme = this.themeService.getPreferredTheme();
    this.themeService.applyTheme(preferredTheme);
  }

  toggleTheme(): void {
    const newTheme =
      this.themeService.getPreferredTheme() === 'dark' ? 'light' : 'dark';
    this.themeService.setStoredTheme(newTheme);
  }
}
