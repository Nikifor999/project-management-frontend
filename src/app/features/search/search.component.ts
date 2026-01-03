import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { SEARCH } from '../../../graphql/search.queries';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  queryControl = this.fb.control('');
  loading = false;
  results: any[] = [];
  error: string | null = null;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['q']?.trim();
      if (q && q.length >= 3) {
        this.queryControl.setValue(q);
        this.onSearch();
      }
    });
  }

  onSearch(): void {
    const q = this.queryControl.value?.trim();
    if (!q || q.length < 3) {
      this.results = [];
      return;
    }
    this.loading = true;
    this.apollo.query<{ search: any[] }>({
      query: SEARCH,
      variables: { query: q },
      fetchPolicy: 'no-cache'
    }).subscribe({
      next: (res) => {
        this.results = res.data.search;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.error = 'Search failed';
        this.loading = false;
      }
    });
  }

  openProject(id: string) {
    this.router.navigate(['/project', id]);
  }
}
