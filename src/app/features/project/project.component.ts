import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { GET_PROJECT } from '../../../graphql/project.queries';
import {
  UPDATE_PROJECT,
  CREATE_NOTE,
  REMOVE_NOTE,
  UPDATE_NOTE,
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
  createdDate?: string;
  modifiedDate?: string;
  notes?: Note[];
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
  editingNoteId: string | null = null;
  editNoteForm: FormGroup;
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
    console.log('ProjectComponent: constructor');
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.createNoteForm = this.fb.group({
      title: ['', [Validators.required]],
      content: [''],
      labels: [''],
      pinned: [false],
      visibility: ['private']
    });

    this.editNoteForm = this.fb.group({
      title: ['', [Validators.required]],
      content: [''],
      labels: [''],
      pinned: [false],
      visibility: ['private']
    });
  }

  ngOnInit(): void {
    console.log('ProjectComponent: ngOnInit start');
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    console.log('ProjectComponent: route id=', this.projectId);
    this.loading = true;
    this.loadProject();
  }

  loadProject(): void {
    this.apollo.query<{ getProject: Project }>({
      query: GET_PROJECT,
      variables: { projectId: this.projectId },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (res) => {
        console.log('Project loaded:', res);
        if (!res.data || !res.data.getProject) {
          this.error = 'Project not found or API structure mismatch';
          this.loading = false;
          return;
        }
        this.project = res.data.getProject;
        if (this.project?.notes) {
          this.notes = this.project.notes;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error = 'Failed to load project details';
        this.loading = false;
      }
    });
  }

  loadProjectNotes(): void {
    // Notes are now loaded as part of the project query
  }

  toggleEditForm(): void {
    this.editingProject = !this.editingProject;
    if (this.editingProject && this.project) {
      this.editForm.patchValue({
        name: this.project.name,
        description: this.project.description || ''
      });
    }
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
          this.error = null;
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
          this.notes = [...this.notes, result.data.createNote];
          this.createNoteForm.reset();
          this.showCreateNoteForm = false;
          this.error = null;
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
          this.error = null;
        },
        error: (err) => {
          console.error('Error deleting note:', err);
          this.error = 'Failed to delete note';
        }
      });
    }
  }

  startEditNote(note: Note): void {
    this.editingNoteId = note.id;
    this.editNoteForm.patchValue({
      title: note.title,
      content: note.content || '',
      labels: note.labels ? note.labels.join(', ') : '',
      pinned: note.pinned,
      visibility: note.visibility || 'private'
    });
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.editNoteForm.reset();
  }

  saveNoteUpdate(): void {
    if (!this.editingNoteId || this.editNoteForm.invalid) {
      return;
    }

    const noteInput = {
      ...this.editNoteForm.value,
      labels: this.editNoteForm.value.labels.split(',').map((l: string) => l.trim()).filter((l: string) => l)
    };

    this.apollo.mutate<{ updateNote: Note }>({
      mutation: UPDATE_NOTE,
      variables: { noteId: this.editingNoteId, input: noteInput }
    }).subscribe({
      next: (result) => {
        if (result.data?.updateNote) {
          this.notes = this.notes.map(n => n.id === this.editingNoteId ? result.data!.updateNote : n);
          this.cancelEditNote();
          this.error = null;
        }
      },
      error: (err) => {
        console.error('Error updating note:', err);
        this.error = 'Failed to update note';
      }
    });
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
    if (this.project) {
      this.project = { ...this.project, isArchive: true }; // optimistic update
    }

    this.apollo.mutate({
      mutation: ARCHIVE_PROJECT,
      variables: { projectId: this.projectId },
      optimisticResponse: {
        archiveProject: {
          __typename: 'Project',
          id: this.projectId,
          isArchive: true
        }
      }
    }).subscribe({
      next: () => {
        this.error = null;
        this.loadProject();
      },
      error: (err) => {
        console.error('Error archiving project:', err);
        this.error = 'Failed to archive project';
        this.loadProject();
      }
    });
  }

  unarchiveProject(): void {
    if (this.project) {
      this.project = { ...this.project, isArchive: false }; // optimistic update
    }

    this.apollo.mutate({
      mutation: UNARCHIVE_PROJECT,
      variables: { projectId: this.projectId },
      optimisticResponse: {
        unarchiveProject: {
          __typename: 'Project',
          id: this.projectId,
          isArchive: false
        }
      }
    }).subscribe({
      next: () => {
        this.error = null;
        this.loadProject();
      },
      error: (err) => {
        console.error('Error unarchiving project:', err);
        this.error = 'Failed to unarchive project';
        this.loadProject();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
