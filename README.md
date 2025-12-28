# Project Management Frontend

A modern Angular + GraphQL frontend for the Project Management application. Features include user authentication (SignUp/SignIn), project management, and note management.

## Features

- **Authentication**: Sign up and sign in with JWT tokens
- **Projects**: View all your projects, create new ones, edit existing ones, and archive/delete projects
- **Notes**: Create, view, and delete notes within projects with labels, visibility settings, and pinning
- **Responsive Design**: Built with Angular 17 and styled with SCSS
- **GraphQL Integration**: Apollo Client for seamless GraphQL operations

## Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI 17+
- Backend running on http://localhost:3000/graphql

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Update the GraphQL endpoint in `src/app/core/graphql/apollo-config.service.ts` if your backend runs on a different URL:

```typescript
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql', // Change this if needed
  credentials: 'include'
});
```

## Running the Application

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will reload when you modify source files.

### Build for Production

```bash
npm run build
```

Production artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/           # Route guards (AuthGuard)
│   │   ├── services/         # Core services (AuthService)
│   │   └── graphql/          # Apollo GraphQL setup
│   ├── features/
│   │   ├── auth/             # Sign up and sign in pages
│   │   ├── home/             # Projects list page
│   │   └── project/          # Project detail with notes
│   ├── app.component.*       # Root component
│   └── app.routes.ts         # Route definitions
├── graphql/                  # GraphQL queries and mutations
└── styles.scss               # Global styles
```

## Key Components

### AuthService
Handles user authentication, token management, and state.

**Methods:**
- `signUp(input: SignUpInput): Observable<AuthResponse>` - Register new user
- `signIn(input: SignInInput): Observable<AuthResponse>` - Login user
- `logout(): void` - Logout user
- `isAuthenticated(): boolean` - Check authentication status
- `getAccessToken(): string | null` - Get current access token

### AuthGuard
Protects routes that require authentication. Redirects to `/sign-in` if not authenticated.

### Apollo Client Configuration
- Automatic Bearer token injection in request headers
- Error handling with automatic logout on 401/Unauthorized
- Network-only fetch policy for fresh data

## GraphQL Operations

### Auth Mutations
- `signUp`: Register new user with email, name, and password
- `signIn`: Login with email and password
- `logout`: Logout current user
- `refreshTokens`: Refresh access token

### Project Queries
- `getUsersProjects`: Get all projects for current user
- `getProjectsNotes`: Get all notes for a specific project
- `getUsersNotes`: Get all notes for current user

### Project Mutations
- `createProject`: Create new project
- `updateProject`: Update project details
- `removeProject`: Delete project
- `archiveProject`: Archive project
- `unarchiveProject`: Unarchive project
- `createNote`: Create note in project
- `removeNote`: Delete note

## Authentication Flow

1. User signs up/in with credentials
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. Apollo Client automatically adds `Authorization: Bearer {accessToken}` header to requests
5. On 401 error, user is logged out and redirected to sign-in

## Styling

The application uses SCSS with a consistent color scheme:
- Primary: #007bff (Blue)
- Danger: #d32f2f (Red)
- Secondary: #6c757d (Gray)
- Background: #f5f5f5 (Light Gray)

## Troubleshooting

**"Cannot GET /graphql" error**
- Ensure backend is running on http://localhost:3000/graphql
- Update the URI in `apollo-config.service.ts` if backend runs elsewhere

**Authentication not persisting**
- Check browser localStorage for `accessToken` and `refreshToken`
- Verify backend JWT configuration

**CORS errors**
- Ensure backend has CORS enabled for http://localhost:4200

## Development

### Generate a new component
```bash
ng generate component features/my-feature
```

### Run tests
```bash
npm test
```

### Lint
```bash
npm run lint
```

## License

MIT
