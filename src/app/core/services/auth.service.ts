import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SIGN_UP, SIGN_IN, LOGOUT } from '../../../graphql/auth.mutations';

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apollo: Apollo) {}

  signUp(input: SignUpInput): Observable<AuthResponse> {
    return this.apollo.mutate<{ signUp: AuthResponse }>({
      mutation: SIGN_UP,
      variables: { input }
    }).pipe(
      map(result => {
        if (result.data?.signUp) {
          this.setTokens(result.data.signUp.accessToken, result.data.signUp.refreshToken);
          this.isAuthenticatedSubject.next(true);
          return result.data.signUp;
        }
        throw new Error('No data returned from signup');
      }),
      catchError(error => {
        console.error('Sign up error:', error);
        throw error;
      })
    );
  }

  signIn(input: SignInInput): Observable<AuthResponse> {
    return this.apollo.mutate<{ signIn: AuthResponse }>({
      mutation: SIGN_IN,
      variables: { input }
    }).pipe(
      map(result => {
        if (result.data?.signIn) {
          this.setTokens(result.data.signIn.accessToken, result.data.signIn.refreshToken);
          this.isAuthenticatedSubject.next(true);
          return result.data.signIn;
        }
        throw new Error('No data returned from signin');
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    this.apollo.mutate({ mutation: LOGOUT }).subscribe(() => {
      this.clearTokens();
      this.isAuthenticatedSubject.next(false);
    });
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
