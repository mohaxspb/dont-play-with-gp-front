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
  approvedDate: Date | null;

  published: boolean;
  publisherId: number | null;
  publishedDate: Date | null;

  created: Date;
  updated: Date;

  author: GpUser | null;
  approver: GpUser | null;
  publisher: GpUser | null;

  versions: [ArticleTranslationVersion];
}
