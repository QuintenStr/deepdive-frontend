import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/service/user.service';
import { UsersForListSafe } from '../../../shared/interface/response/safeuserlistdto.model';
import { AppToastService } from '../../../shared/service/toast.service';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss',
})
export class UsersTableComponent implements OnInit {
  allusers: UsersForListSafe[] = [];
  alluserswithfilter: UsersForListSafe[] = [];
  userId: string = '';
  searchText: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: AppToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.userService.getUsers().subscribe({
      next: (response: UsersForListSafe[]) => {
        this.allusers = response;
        this.alluserswithfilter = response;
      },
      error: () => {
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
  }

  onSearchChange(event: Event): void {
    const searchValue: string = (
      event.target as HTMLInputElement
    ).value.toLowerCase();

    this.searchText = (event.target as HTMLInputElement).value;

    this.alluserswithfilter = this.allusers.filter(
      e =>
        e.firstName.toLowerCase().includes(searchValue) ||
        e.lastName.toLowerCase().includes(searchValue) ||
        e.username.toLowerCase().includes(searchValue) ||
        e.email.toLowerCase().includes(searchValue)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.alluserswithfilter = this.allusers;
  }

  openUser(user: string) {
    this.router.navigate(['/admin/users/edit', user]);
  }
}
