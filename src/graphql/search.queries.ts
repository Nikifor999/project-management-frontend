import gql from 'graphql-tag';

export const SEARCH = gql`
  query Search($query: String!) {
    search(query: $query) {
      __typename
      ... on Project {
        id
        name
        description
        ownerName
        createdDate
        modifiedDate
        isArchive
        noteCount
      }
      ... on Note {
        id
        title
        content
        projectId
        labels
        pinned
        visibility
        createdAt
        updatedAt
      }
    }
  }
`;
