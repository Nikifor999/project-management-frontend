import gql from 'graphql-tag';

export const SIGN_UP = gql`
  mutation SignUp($input: CreateUserInput!) {
    signUp(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const REFRESH_TOKENS = gql`
  mutation RefreshTokens {
    refreshTokens {
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
