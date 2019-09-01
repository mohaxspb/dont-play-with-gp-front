export class ArticleTranslationVersion {
  id: number;

  articleTranslationId: number;
  text: string;

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
