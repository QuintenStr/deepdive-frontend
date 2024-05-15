import { Component, OnInit, TemplateRef } from '@angular/core';
import { ThemeService } from '../../shared/service/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../shared/service/user.service';
import { IdInputDto } from '../../shared/interface/request/viewapplicationidinputdto.model';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { AppToastService } from '../../shared/service/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  selectedTheme!: string;
  selectedLanguage!: string;

  constructor(
    private themeService: ThemeService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthenticationService,
    private toastService: AppToastService
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

  open(content: TemplateRef<unknown>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (event: string) => {
          this.handleModalClose(event);
        },
        () => {
          this.handleModalDismiss();
        }
      );
  }

  handleModalClose(event: string): void {
    const input: IdInputDto = {
      Id: this.authService.getId(),
    };
    if (event == 'ok disable') {
      this.userService.disableAccount(input).subscribe({
        next: () => {
          this.authService.logout();
        },
        error: () => {
          this.toastService.show('Error', 'Something went wrong.');
        },
      });
    }
    if (event == 'ok delete') {
      this.userService.deleteAccount(input).subscribe({
        next: () => {
          this.authService.logout();
        },
        error: () => {
          this.toastService.show('Error', 'Something went wrong.');
        },
      });
    }
  }

  handleModalDismiss(): void {
    // do not delete/disable, nothing to handle
  }
}
