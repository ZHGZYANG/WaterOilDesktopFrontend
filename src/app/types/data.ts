export interface Photo {
  id: string;
  path: string;
  gps: string;
  date: string;
  result: string;
  notes: string;
  tags: string;
  username: string;
}

export interface User {
  name: string;
  username: string;
  email: string;
}

export interface Response {
  status: number;
  msg: any;
  meta: any;
}

export interface Tag {
  name: string;
}

export interface NoteDialogData {
  noteForEdit: string;
}

export interface TagsDialogData {
  tagsForEdit: Tag[];
}

export enum FilterModel {
  Date = 'date',
  Tags = 'tags',
  Notes = 'notes',
  Geo = 'geo',
}
