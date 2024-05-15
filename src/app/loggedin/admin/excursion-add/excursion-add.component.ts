import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppToastService } from '../../../shared/service/toast.service';
import { UserService } from '../../../shared/service/user.service';
import {
  NgbCalendar,
  NgbDateStruct,
  NgbDate,
  NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { DayTemplateContext } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-day-template-context';
import { NgbTime } from '@ng-bootstrap/ng-bootstrap/timepicker/ngb-time';
import { AddExcursion } from '../../../shared/interface/request/excursionadddto.model';
import { ExcursionsService } from '../../../shared/service/excursions.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AzureBlobStorageService } from '../../../shared/service/azureblobstorage.service';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { useGeographic } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { Coordinate } from 'ol/coordinate';
import { IdOutputDto } from '../../../shared/interface/response/idoutputdto.model';
import { LoadingService } from '../../../shared/service/loading.service';
@Component({
  selector: 'app-excursion-add',
  templateUrl: './excursion-add.component.html',
  styleUrl: './excursion-add.component.scss',
})
export class ExcursionAddComponent implements OnInit {
  newExcursionForm: FormGroup;
  selectedImage: File | undefined;
  selectedDate!: NgbDateStruct;
  minDate: NgbDateStruct;
  customDay!: TemplateRef<DayTemplateContext>;
  errorMessage: string = '';
  showError: boolean = false;
  time: NgbTimeStruct = { hour: 12, minute: 0, second: 0 };
  hourStep = 1;
  minuteStep = 15;
  public map!: Map;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  constructor(
    private activeRouter: ActivatedRoute,
    private userService: UserService,
    private toastService: AppToastService,
    private blobService: AzureBlobStorageService,
    protected router: Router,
    private calendar: NgbCalendar,
    private excursionService: ExcursionsService,
    private loadingService: LoadingService
  ) {
    useGeographic();
    const now = this.calendar.getToday();
    this.minDate = now;

    this.newExcursionForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      date: new FormControl(now, [
        Validators.required,
        this.dateNotInPastValidator(),
      ]),
      lat: new FormControl(0, [Validators.required]),
      long: new FormControl(0, [Validators.required]),
      time: new FormControl(this.time, [Validators.required]),
      coverImage: new FormControl(undefined, [
        this.fileNotNull,
        this.fileTypeValidator(['image/jpeg', 'image/png']),
      ]),
    });
  }

  ngOnInit(): void {
    this.initializeMap();
    this.map.on('click', event => {
      const clickedCoordinate = event.coordinate;
      this.updateFormValues(clickedCoordinate);
    });

    this.newExcursionForm.get('lat')?.valueChanges.subscribe(() => {
      this.updateMap();
    });
    this.newExcursionForm.get('long')?.valueChanges.subscribe(() => {
      this.updateMap();
    });
  }

  initializeMap() {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        maxZoom: 18,
      }),
      target: 'map',
    });
  }

  updateFormValues(coordinates: Coordinate) {
    const [long, lat] = coordinates;
    this.newExcursionForm.patchValue({
      lat: lat,
      long: long,
    });
  }

  updateMap() {
    const lat = this.newExcursionForm.get('lat')?.value;
    const long = this.newExcursionForm.get('long')?.value;

    this.removePreviousIcons();

    const iconFeature = new Feature({
      geometry: new Point([long, lat]),
      name: 'Marker',
    });

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.95],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
        scale: 0.075,
      }),
    });

    iconFeature.setStyle(iconStyle);

    const vectorSource = new VectorSource({
      features: [iconFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.map.addLayer(vectorLayer);
  }

  removePreviousIcons() {
    this.map.getLayers().forEach(layer => {
      if (layer instanceof VectorLayer) {
        this.map.removeLayer(layer);
      }
    });
  }

  addExcursion = (newExcursionFormValue: {
    title: string;
    description: string;
    date: NgbDate;
    time: NgbTime;
    lat: number;
    long: number;
  }) => {
    this.loadingService.show();
    this.isUploading = true;

    const imageName = this.generateUUID();

    const dateTime = new Date(
      newExcursionFormValue.date.year,
      newExcursionFormValue.date.month - 1,
      newExcursionFormValue.date.day,
      newExcursionFormValue.time.hour,
      newExcursionFormValue.time.minute,
      newExcursionFormValue.time.second
    );

    const formattedDateTime = dateTime.toISOString().slice(0, 19) + 'Z';

    const body: AddExcursion = {
      Title: newExcursionFormValue.title,
      Description: newExcursionFormValue.description,
      DateTime: formattedDateTime,
      ImageName: imageName,
      Coordinates: {
        Lat: newExcursionFormValue.lat,
        Long: newExcursionFormValue.long,
      },
    };

    this.excursionService.AddExcursion(body).subscribe({
      next: (response: IdOutputDto) => {
        const selectedFile: File | undefined =
          this.newExcursionForm.get('coverImage')?.value;
        if (selectedFile) {
          this.loadingService.show();

          this.blobService.uploadFileWithProgress(
            selectedFile,
            'excursions',
            imageName,
            (progress: number) => (this.uploadProgress = progress),
            () => (
              this.router.navigate(['/excursions/details/' + response.id]),
              (this.isUploading = false),
              this.loadingService.hide()
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error: any) => {
              console.error('Upload failed:', error);
              this.errorMessage = 'Failed to upload image.';
              this.showError = true;
              this.isUploading = false;
              this.loadingService.hide();
            }
          );
        } else {
          this.router.navigate(['/excursions/details/' + response.id]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;
        this.showError = true;
      },
    });
  };

  uploadFileToAzureStorage(selectedFile: File, name: string) {
    this.blobService.uploadFile(selectedFile, 'excursions', name, () => {});
  }

  validateControl = (controlName: string) => {
    const control = this.newExcursionForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.newExcursionForm.get(controlName);
    return control?.hasError(errorName);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileChange(event: any) {
    const selectedFile = event.target.files[0];

    const coverImageControl = this.newExcursionForm.get('coverImage');
    if (coverImageControl instanceof FormControl) {
      coverImageControl.patchValue(selectedFile);
      coverImageControl.markAsTouched();
    }
  }

  fileTypeValidator(allowedTypes: string[]): ValidatorFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;

      if (file) {
        return allowedTypes.includes(file.type)
          ? null
          : { invalidFileType: true };
      }

      return null;
    };
  }

  fileNotNull: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const file = control.value;
    if (file === undefined || file === null) {
      return { nullFile: true };
    }
    return null;
  };

  dateNotInPastValidator(): ValidatorFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate: NgbDateStruct = control.value;
      const currentDate: Date = new Date();

      if (selectedDate) {
        const selectedDateTime: Date = new Date(
          selectedDate.year,
          selectedDate.month - 1,
          selectedDate.day
        );

        const currentDateTime: Date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );

        if (selectedDateTime < currentDateTime) {
          return { dateInPast: true };
        }
      }

      return null;
    };
  }

  generateUUID(): string {
    const cryptoObj = window.crypto;
    if (!cryptoObj) {
      console.error('Crypto API not supported in this environment.');
      return '';
    }

    const buffer = new Uint8Array(16);
    cryptoObj.getRandomValues(buffer);

    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    const hexArray = Array.from(buffer).map(byte =>
      byte.toString(16).padStart(2, '0')
    );

    const uuid = [
      hexArray.slice(0, 4).join(''),
      hexArray.slice(4, 6).join(''),
      hexArray.slice(6, 8).join(''),
      hexArray.slice(8, 10).join(''),
      hexArray.slice(10).join(''),
    ].join('-');

    return uuid;
  }
}
