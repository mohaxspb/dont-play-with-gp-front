import {ArticleTranslation} from './ArticleTranslation';
import {GpUser} from '../auth/GpUser';

export class Article {
  id: number;

  originalLangId: number;

  /**
   * source* is null, if this is original article for dont-play-with-gp. Else - data from other site
   */
  sourceTitle: string | null;
  /**
   * source* is null, if this is original article for dont-play-with-gp. Else - data from other site
   */
  sourceUrl: string | null;
  /**
   * source* is null, if this is original article for dont-play-with-gp. Else - data from other site
   */
  sourceAuthorName: string | null;

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

  translations: [ArticleTranslation];
}
