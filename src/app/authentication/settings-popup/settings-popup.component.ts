import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../shared/service/theme.service';

@Component({
  selector: 'app-settings-popup',
  templateUrl: './settings-popup.component.html',
  styleUrl: './settings-popup.component.scss',
})
export class SettingsPopupComponent implements OnInit {
  selectedTheme!: string;
  selectedLanguage!: string;

  constructor(
    private themeService: ThemeService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.selectedTheme = this.themeService.getPreferredTheme();
    this.selectedLanguage = this.translate.currentLang;
  }

  selectTheme(theme: string): void {
    this.selectedTheme = theme;
    this.themeService.setStoredTheme(theme);
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.selectedLanguage = lang;
  }
}
