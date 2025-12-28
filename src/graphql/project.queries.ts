import gql from 'graphql-tag';

export const GET_USERS_PROJECTS = gql`
  query GetUsersProjects {
    getUsersProjects {
      id
      name
      description
      ownerName
      createdDate
      modifiedDate
      isArchive
      noteCount
    }
  }
`;

export const GET_PROJECT_NOTES = gql`
  query GetProjectNotes($projectId: String!) {
    getProjectsNotes(projectId: $projectId) {
      id
      title
      content
      labels
      pinned
      visibility
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS_NOTES = gql`
  query GetUsersNotes {
    getUsersNotes {
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
`;
