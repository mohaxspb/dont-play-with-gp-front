export class Article {
  id: number;

  langId: number;
  articleId: number;

  title: string;
  shortDescription: string;
  imageUrl: string;

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
