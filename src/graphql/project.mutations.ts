import gql from 'graphql-tag';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: String!, $input: UpdateProjectInput!) {
    updateProject(projectId: $projectId, input: $input) {
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

export const REMOVE_PROJECT = gql`
  mutation RemoveProject($projectId: String!) {
    removeProject(projectId: $projectId)
  }
`;

export const ARCHIVE_PROJECT = gql`
  mutation ArchiveProject($projectId: String!) {
    archiveProject(projectId: $projectId){
      id
      isArchive
    }
  }
`;

export const UNARCHIVE_PROJECT = gql`
  mutation UnarchiveProject($projectId: String!) {
    unarchiveProject(projectId: $projectId){
      id
      isArchive
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
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

export const REMOVE_NOTE = gql`
  mutation RemoveNote($noteId: String!) {
    removeNote(noteId: $noteId)
  }
`;
