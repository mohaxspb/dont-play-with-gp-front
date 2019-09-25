import {ArticleTranslationVersion} from './ArticleTranslationVersion';
import {GpUser} from '../auth/GpUser';

export class ArticleTranslation {
  id: number;

  langId: number;
  articleId: number;

  title: string;
  shortDescription: string | null;
  imageUrl: string | null;

  authorId: number;

  approved: boolean;
  approverId: number | null;
  approvedDate: string | null;

  published: boolean;
  publisherId: number | null;
  publishedDate: string | null;

  created: string;
  updated: string;

  author: GpUser | null;
  approver: GpUser | null;
  publisher: GpUser | null;

  versions: [ArticleTranslationVersion];
}
