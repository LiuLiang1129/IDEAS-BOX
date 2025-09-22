
export interface User {
  name: string;
  groupId: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  groupId: string;
  comments: Comment[];
  votes: string[]; // Array of user names who voted
}

export interface Group {
  id:string;
  name: string;
  color: string;
}

export interface DiscussionTopic {
  title: string;
  description: string;
  imageUrl?: string;
}

export enum AppView {
  LOGIN,
  GROUP,
  RESULTS,
  ADMIN,
}