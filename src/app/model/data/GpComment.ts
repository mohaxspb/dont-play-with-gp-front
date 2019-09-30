import {GpUser} from '../auth/GpUser';

export class GpComment {
  id: number;
  text: string;
  authorId: number;
  articleId: number;
  created: string | null;
  updated: string | null;

  author: GpUser;
}
