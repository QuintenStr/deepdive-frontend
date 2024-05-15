import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppToastService } from '../../../shared/service/toast.service';
import { ExcursionsService } from '../../../shared/service/excursions.service';
import { ExcursionDetailInfo } from '../../../shared/interface/response/excursiondetaildto.model';
import { IdInputDto } from '../../../shared/interface/request/viewapplicationidinputdto.model';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useGeographic } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Icon, Style } from 'ol/style.js';
import { AuthenticationService } from '../../../shared/service/authentication.service';
import { ExcursionParticipantDto } from '../../../shared/interface/request/excursionparticipantdto.model';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';
import { UserService } from '../../../shared/service/user.service';
import { UsersTypeahead } from '../../../shared/interface/response/userstypeaheaddto.model';
import { TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExcursionMultipleParticipantsDto } from '../../../shared/interface/request/excursionmultipleparticipantsdto.model';

@Component({
  selector: 'app-excursion-detail',
  templateUrl: './excursion-detail.component.html',
  styleUrl: './excursion-detail.component.scss',
})
export class ExcursionDetailComponent implements OnInit {
  excursionId: string = '';
  excursion!: ExcursionDetailInfo;
  map!: Map;
  closeResult = '';

  removeFromSelectedUsers(userId: string): void {
    this.selectedUsers = this.selectedUsers.filter(user => user.id !== userId);
  }

  open(content: TemplateRef<unknown>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => {
          this.handleModalClose();
        },
        () => {
          this.handleModalDismiss();
        }
      );
  }

  handleModalClose(): void {
    const body: ExcursionMultipleParticipantsDto = {
      userId: this.selectedUsers.map(user => user.id),
      excursionId: this.excursionId,
    };
    this.excursionService.AddMultipleExcursionParticipant(body).subscribe({
      next: () => {
        this.selectedUsers = [];
        this.loadData();
      },
      error: () => {
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
    this.model = undefined;
  }

  handleModalDismiss(): void {
    this.model = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  selectedUsers: UsersTypeahead[] = [];

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term =>
        term.length < 2
          ? of([])
          : this.userService.getUsersTypeahead({ input: term }).pipe(
              map(users =>
                users
                  .filter(
                    user =>
                      !this.excursion.participants.some(
                        participant => participant.id === user.id
                      ) &&
                      !this.selectedUsers.some(
                        selectedUser => selectedUser.id === user.id
                      )
                  )
                  .map(filteredUser => ({
                    firstName: filteredUser.firstName,
                    lastName: filteredUser.lastName,
                    id: filteredUser.id,
                    userName: filteredUser.userName,
                  }))
              )
            )
      )
    );

  formatter = (x: { firstName: string; lastName: string }) =>
    `${x.firstName} ${x.lastName}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect(event: any): void {
    this.selectedUsers.push(event.item);
    this.model = '';
  }

  constructor(
    private activeRouter: ActivatedRoute,
    private excursionService: ExcursionsService,
    private toastService: AppToastService,
    private router: Router,
    protected authService: AuthenticationService,
    private userService: UserService,
    private modalService: NgbModal
  ) {
    useGeographic();
  }

  ngOnInit() {
    this.loadData();
  }
  loadData(): void {
    // map clearen, hij werd geaccumuleerd bij meerdere loaddata calls
    if (this.map) {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        mapElement.innerHTML = '';
      }
    }

    this.excursionId = this.activeRouter.snapshot.paramMap.get('id')!;

    if (this.excursionId === null) {
      this.router.navigate(['/home']);
      this.toastService.show('Error', 'Something went wrong loading the data.');
    }

    const input: IdInputDto = {
      Id: this.excursionId,
    };

    this.excursionService.GetExcursionById(input).subscribe({
      next: (response: ExcursionDetailInfo) => {
        this.excursion = response;
        const iconFeature = new Feature({
          geometry: new Point([
            this.excursion.coordinates.long,
            this.excursion.coordinates.lat,
          ]),
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

        this.map = new Map({
          layers: [new TileLayer({ source: new OSM() }), vectorLayer],
          view: new View({
            center: [
              this.excursion.coordinates.long,
              this.excursion.coordinates.lat,
            ],
            zoom: 12,
          }),
          target: 'map',
        });
      },
      error: () => {
        this.router.navigate(['/home']);
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
  }

  editExcursion(id: string): void {
    this.router.navigate(['/admin/excursion-edit/' + id]);
  }

  formatDate(dateString: string): string {
    const datetimeStringWithZ = dateString + 'Z';
    const date = new Date(datetimeStringWithZ);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { timeStyle: 'short' })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleImageError(event: any) {
    event.target.src =
      'https://storagedeepdiveapp.blob.core.windows.net/excursions/imgplaceholder.jpg';
  }

  userJoinedExcursion(): boolean {
    const userId = this.authService.getId();
    const hasUserJoined = this.excursion.participants.some(
      participant => participant.id === userId
    );
    return hasUserJoined;
  }

  joinExcursion(): void {
    const body: ExcursionParticipantDto = {
      userId: this.authService.getId(),
      excursionId: this.excursionId,
    };
    this.excursionService.AddExcursionParticipant(body).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        this.toastService.show('Error', 'Something went wrong.');
      },
    });
  }

  leaveExcursion(): void {
    const body: ExcursionParticipantDto = {
      userId: this.authService.getId(),
      excursionId: this.excursionId,
    };
    this.excursionService.RemoveExcursionParticipant(body).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        this.toastService.show('Error', 'Something went wrong.');
      },
    });
  }

  removeUserFromExcursion(userid: string): void {
    const body: ExcursionParticipantDto = {
      userId: userid,
      excursionId: this.excursionId,
    };
    this.excursionService.RemoveExcursionParticipant(body).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        this.toastService.show('Error', 'Something went wrong.');
      },
    });
  }
}
