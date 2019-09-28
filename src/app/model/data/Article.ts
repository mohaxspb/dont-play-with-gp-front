import {ArticleTranslation} from './ArticleTranslation';
import {GpUser} from '../auth/GpUser';
import {Tag} from './Tag';

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
  approvedDate: string | null;

  published: boolean;
  publisherId: number | null;
  publishedDate: string | null;

  created: string;
  updated: string;

  author: GpUser | null;
  approver: GpUser | null;
  publisher: GpUser | null;

  translations: [ArticleTranslation];

  tags: [Tag];
}
