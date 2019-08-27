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
}
