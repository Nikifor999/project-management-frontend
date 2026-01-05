import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { GET_USER } from '../../../graphql/user.queries';
import { UPDATE_USER, CHANGE_PASSWORD } from '../../../graphql/user.mutations';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error: string | null = null;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private apollo: Apollo, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.apollo.query<{ getUser: User }>({ query: GET_USER, fetchPolicy: 'network-only' }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.data?.getUser) {
          this.user = res.data.getUser;
          this.profileForm.patchValue({ name: this.user.name, email: this.user.email });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading user:', err);
        this.error = 'Failed to load user';
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const input = { name: this.profileForm.value.name };
    this.apollo.mutate<{ updateUser: User }>({ mutation: UPDATE_USER, variables: { input } }).subscribe({
      next: (res) => {
        if (res.data?.updateUser) {
          this.user = res.data.updateUser;
          this.profileForm.patchValue({ name: this.user.name });
          this.error = null;
        }
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error = 'Failed to update profile';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const input = { oldPassword: this.passwordForm.value.oldPassword, newPassword: this.passwordForm.value.newPassword };
    this.apollo.mutate<{ changePassword: { success: boolean; message?: string } }>({ mutation: CHANGE_PASSWORD, variables: { input } }).subscribe({
      next: (res) => {
        const resp = res.data?.changePassword;
        if (resp?.success) {
          this.passwordForm.reset();
          this.error = null;
          alert('Password changed successfully');
        } else {
          this.error = resp?.message || 'Failed to change password';
        }
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.error = 'Failed to change password';
      }
    });
  }
}
