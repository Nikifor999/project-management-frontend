import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { AuthService } from './app/core/services/auth.service';
import { ApolloConfigService } from './app/core/graphql/apollo-config.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    AuthService,
    ApolloConfigService,
    Apollo,
    {
      provide: APP_INITIALIZER,
      useFactory: (apolloConfig: ApolloConfigService) => () => {
        // Force initialization of Apollo client
        return Promise.resolve();
      },
      deps: [ApolloConfigService],
      multi: true
    }
  ]
}).catch(err => console.error(err));
