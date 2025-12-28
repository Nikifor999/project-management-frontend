import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApolloConfigService {
  private apollo = inject(Apollo);
  private httpLink = inject(HttpLink);
  private authService = inject(AuthService);

  constructor() {
    this.initializeApollo();
    console.log('Apollo client initialized');
  }

  private initializeApollo(): void {
    const httpLink = this.httpLink.create({ uri: 'http://localhost:3000/graphql' });

    const authLink = setContext((operation, prevContext) => {
      const token = this.authService.getAccessToken();
      const headers = {
        ...(prevContext && (prevContext as any).headers),
        authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };
      return { headers } as any;
    });

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message }) => {
          console.error('GraphQL error:', message);
          if (message && String(message).includes('Unauthorized')) {
            this.authService.logout();
          }
        });
      }
      if (networkError) {
        console.error('Network error:', networkError);
      }
    });

    const link = ApolloLink.from([errorLink as any, authLink as any, httpLink as any]);

    this.apollo.create({
      link,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'network-only' },
        query: { fetchPolicy: 'network-only' }
      }
    });
  }
}
