import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AuthenticationService } from '../../../shared/service/authentication.service';
import { ExcursionsService } from '../../../shared/service/excursions.service';
import { AppToastService } from '../../../shared/service/toast.service';
import { ExcursionsListDto } from '../../../shared/interface/response/excursionslistdto.model';
import { Router } from '@angular/router';
import { IdInputDto } from '../../../shared/interface/request/viewapplicationidinputdto.model';
import { AzureBlobStorageService } from '../../../shared/service/azureblobstorage.service';
import Masonry from 'masonry-layout';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-excursions-list',
  templateUrl: './excursions-list.component.html',
  styleUrl: './excursions-list.component.scss',
})
export class ExcursionsListComponent implements OnInit, AfterViewChecked {
  constructor(
    protected authService: AuthenticationService,
    private excursionService: ExcursionsService,
    private toastService: AppToastService,
    private router: Router,
    private blobService: AzureBlobStorageService,
    private modalService: NgbModal
  ) {}
  @ViewChild('grid') gridElement!: ElementRef;
  masonryInstance: Masonry | null = null;

  ngAfterViewChecked() {
    this.initializeMasonry();
  }

  excursions!: ExcursionsListDto[];
  baseUrl = 'https://storagedeepdiveapp.blob.core.windows.net/excursions/';

  ngOnInit(): void {
    this.loaddata();
  }

  initializeMasonry(): void {
    if (this.masonryInstance !== null && this.masonryInstance !== undefined) {
      // wtf? error masonryinstance may be undefined or null, ok typescript, check de lijn hierboven danku
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.masonryInstance.destroy();
    }

    this.masonryInstance = new Masonry(this.gridElement.nativeElement, {
      itemSelector: '.grid-item',
      percentPosition: true,
    });
  }

  loaddata(): void {
    this.excursionService.getListExcursions().subscribe({
      next: (response: ExcursionsListDto[]) => {
        this.excursions = response;
        // soms zijn de cards nog niet gerenderd dus wacht 50ms voor masonry calculations nog eens te doen
        this.initializeMasonry();
        setTimeout(() => this.initializeMasonry(), 200);
        this.initializeMasonry();
        // paar keer recalculaten om er voor te zorgen dat final gerenderde versie altijd in orde gecalculate is
      },
      error: () => {
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
  }

  deleteExcursion(excursion: ExcursionsListDto): void {
    const body: IdInputDto = {
      Id: excursion.id,
    };

    this.excursionService.DeleteExcursion(body).subscribe({
      next: () => {
        if (excursion.imageName !== 'imgplaceholder.jpg') {
          this.blobService.deleteFile(
            excursion.imageName,
            'excursions',
            () => {}
          );
        }
        this.loaddata();
      },
      error: () => {
        this.toastService.show(
          'Error',
          'Something went deleting the excursion.'
        );
        this.loaddata();
      },
    });
  }

  // datetime is saved in utc -> format to current timezone
  formatDate(dateString: string): string {
    const datetimeStringWithZ = dateString + 'Z';
    const date = new Date(datetimeStringWithZ);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { timeStyle: 'short' })
    );
  }

  openExcursion(id: string): void {
    this.router.navigate(['/excursions/details/' + id]);
  }

  editExcursion(id: string): void {
    this.router.navigate(['/admin/excursion-edit/' + id]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleImageError(event: any) {
    event.target.src =
      'https://storagedeepdiveapp.blob.core.windows.net/excursions/imgplaceholder.jpg';
  }

  open(content: TemplateRef<unknown>, excursion: ExcursionsListDto) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => {
          this.handleModalClose(excursion);
        },
        () => {
          this.handleModalDismiss();
        }
      );
  }

  handleModalClose(excursion: ExcursionsListDto): void {
    this.deleteExcursion(excursion);
  }

  handleModalDismiss(): void {
    // do not delete, nothing to handle
  }
}
