import {Injectable} from '@angular/core';
import {GpApiService} from '../GpApiService';
import {Observable} from 'rxjs';
import {Article} from '../../model/data/Article';

@Injectable()
export class GpArticleService {

  constructor(private apiService: GpApiService) {
  }

  getArticleById(id: number): Observable<Article> {
    return this.apiService.getArticleById(id);
  }

  getFullArticleById(id: number): Observable<Article> {
    return this.apiService.getFullArticleById(id);
  }

  createArticle(
    languageId: number,
    sourceTitle: string | null,
    sourceAuthorName: string | null,
    sourceUrl: string | null,
    title: string,
    shortDescription: string | null,
    text: string
    // todo image Url
  ): Observable<Article> {
    return this.apiService
      .createArticle(
        languageId,
        sourceTitle,
        sourceAuthorName,
        sourceUrl,
        title,
        shortDescription,
        text
      );
  }

  approveArticle(approve: boolean): Observable<Article> {
    return this.apiService.approveArticle(approve);
  }

  publishArticle(publish: boolean): Observable<Article> {
    return this.apiService.publishArticle(publish);
  }
}
