import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { GET_USERS_PROJECTS } from '../../../graphql/project.queries';
import { CREATE_PROJECT } from '../../../graphql/project.mutations';
import { AuthService } from '../../core/services/auth.service';

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerName: string;
  createdDate: string;
  isArchive: boolean;
  noteCount: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  showCreateForm = false;
  createForm: FormGroup;
  error: string | null = null;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.apollo.query<{ getUsersProjects: Project[] }>({
      query: GET_USERS_PROJECTS
    }).subscribe({
      next: (result) => {
        this.projects = result.data.getUsersProjects;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading = false;
        this.error = 'Failed to load projects';
      }
    });
  }

  viewProject(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset();
    }
  }

  createProject(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.apollo.mutate<{ createProject: Project }>({
      mutation: CREATE_PROJECT,
      variables: {
        input: this.createForm.value
      }
    }).subscribe({
      next: (result) => {
        if (result.data?.createProject) {
          this.projects.push(result.data.createProject);
          this.createForm.reset();
          this.showCreateForm = false;
        }
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.error = 'Failed to create project';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}
