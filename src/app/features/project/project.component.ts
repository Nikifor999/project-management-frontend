import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { GET_PROJECT_NOTES } from '../../../graphql/project.queries';
import {
  UPDATE_PROJECT,
  CREATE_NOTE,
  REMOVE_NOTE,
  REMOVE_PROJECT,
  ARCHIVE_PROJECT,
  UNARCHIVE_PROJECT
} from '../../../graphql/project.mutations';

interface Note {
  id: string;
  title: string;
  content?: string;
  labels: string[];
  pinned: boolean;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerName: string;
  isArchive: boolean;
  noteCount: number;
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  projectId: string = '';
  project: Project | null = null;
  notes: Note[] = [];
  loading = false;
  editingProject = false;
  editForm: FormGroup;
  showCreateNoteForm = false;
  createNoteForm: FormGroup;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.createNoteForm = this.fb.group({
      title: ['', [Validators.required]],
      content: [''],
      labels: [''],
      pinned: [false],
      visibility: ['PRIVATE']
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.loadProjectNotes();
  }

  loadProjectNotes(): void {
    this.loading = true;
    this.apollo.query<{ getProjectsNotes: Note[] }>({
      query: GET_PROJECT_NOTES,
      variables: { projectId: this.projectId }
    }).subscribe({
      next: (result) => {
        this.notes = result.data.getProjectsNotes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.loading = false;
        this.error = 'Failed to load project notes';
      }
    });
  }

  toggleEditForm(): void {
    this.editingProject = !this.editingProject;
  }

  updateProject(): void {
    if (this.editForm.invalid || !this.project) {
      return;
    }

    this.apollo.mutate({
      mutation: UPDATE_PROJECT,
      variables: {
        projectId: this.projectId,
        input: this.editForm.value
      }
    }).subscribe({
      next: (result: any) => {
        if (result.data?.updateProject) {
          this.project = result.data.updateProject;
          this.editingProject = false;
        }
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.error = 'Failed to update project';
      }
    });
  }

  toggleCreateNoteForm(): void {
    this.showCreateNoteForm = !this.showCreateNoteForm;
    if (!this.showCreateNoteForm) {
      this.createNoteForm.reset();
    }
  }

  createNote(): void {
    if (this.createNoteForm.invalid) {
      return;
    }

    const noteInput = {
      ...this.createNoteForm.value,
      projectId: this.projectId,
      labels: this.createNoteForm.value.labels.split(',').map((l: string) => l.trim()).filter((l: string) => l)
    };

    this.apollo.mutate<{ createNote: Note }>({
      mutation: CREATE_NOTE,
      variables: { input: noteInput }
    }).subscribe({
      next: (result) => {
        if (result.data?.createNote) {
          this.notes.push(result.data.createNote);
          this.createNoteForm.reset();
          this.showCreateNoteForm = false;
        }
      },
      error: (err) => {
        console.error('Error creating note:', err);
        this.error = 'Failed to create note';
      }
    });
  }

  deleteNote(noteId: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.apollo.mutate({
        mutation: REMOVE_NOTE,
        variables: { noteId }
      }).subscribe({
        next: () => {
          this.notes = this.notes.filter(n => n.id !== noteId);
        },
        error: (err) => {
          console.error('Error deleting note:', err);
          this.error = 'Failed to delete note';
        }
      });
    }
  }

  deleteProject(): void {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.apollo.mutate({
        mutation: REMOVE_PROJECT,
        variables: { projectId: this.projectId }
      }).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error deleting project:', err);
          this.error = 'Failed to delete project';
        }
      });
    }
  }

  archiveProject(): void {
    this.apollo.mutate({
      mutation: ARCHIVE_PROJECT,
      variables: { projectId: this.projectId }
    }).subscribe({
      next: () => {
        if (this.project) {
          this.project.isArchive = true;
        }
      },
      error: (err) => {
        console.error('Error archiving project:', err);
        this.error = 'Failed to archive project';
      }
    });
  }

  unarchiveProject(): void {
    this.apollo.mutate({
      mutation: UNARCHIVE_PROJECT,
      variables: { projectId: this.projectId }
    }).subscribe({
      next: () => {
        if (this.project) {
          this.project.isArchive = false;
        }
      },
      error: (err) => {
        console.error('Error unarchiving project:', err);
        this.error = 'Failed to unarchive project';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
