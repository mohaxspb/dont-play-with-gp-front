import {ArticleTranslationVersion} from './ArticleTranslationVersion';
import {GpUser} from '../auth/GpUser';

export class ArticleTranslation {
  id: number;

  langId: number;
  articleId: number;

  title: string;
  shortDescription: string;
  imageUrl: string;

  authorId: number;

  approved: boolean;
  approverId: number | null;
  approvedDate: Date | null;

  published: boolean;
  publisherId: number | null;
  publishedDate: Date | null;

  created: Date;
  updated: Date;

  versions: [ArticleTranslationVersion];
  author: GpUser | null;
  approver: GpUser | null;
  publisher: GpUser | null;
}
