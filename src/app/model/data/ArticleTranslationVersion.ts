import {GpUser} from '../auth/GpUser';

export class ArticleTranslationVersion {
  id: number;

  articleTranslationId: number;
  text: string;

  authorId: number;

  approved: boolean;
  approverId: number | null;
  approvedDate: Date | null;

  published: boolean;
  publisherId: number | null;
  publishedDate: Date | null;

  created: Date;
  updated: Date;

  author: GpUser | null;
  approver: GpUser | null;
  publisher: GpUser | null;
}
