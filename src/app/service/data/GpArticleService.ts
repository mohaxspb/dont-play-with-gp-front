import {Injectable} from '@angular/core';
import {GpApiService} from '../GpApiService';
import {Observable} from 'rxjs';
import {Article} from '../../model/data/Article';
import {ArticleTranslation} from '../../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../../model/data/ArticleTranslationVersion';

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

  approveArticle(id: number, approve: boolean): Observable<Article> {
    return this.apiService.approveArticle(id, approve);
  }

  publishArticle(id: number, publish: boolean): Observable<Article> {
    return this.apiService.publishArticle(id, publish);
  }

  approveArticleTranslation(id: number, approve: boolean): Observable<ArticleTranslation> {
    return this.apiService.approveArticleTranslation(id, approve);
  }

  publishArticleTranslation(id: number, publish: boolean): Observable<ArticleTranslation> {
    return this.apiService.publishArticleTranslation(id, publish);
  }

  approveArticleTranslationVersion(id: number, approve: boolean): Observable<ArticleTranslationVersion> {
    return this.apiService.approveArticleTranslationVersion(id, approve);
  }

  publishArticleTranslationVersion(id: number, publish: boolean): Observable<ArticleTranslationVersion> {
    return this.apiService.publishArticleTranslationVersion(id, publish);
  }

  getPublishedArticles(limit: number, offset: number): Observable<Article[]> {
    return this.apiService.getArticles(limit, offset);
  }
}
