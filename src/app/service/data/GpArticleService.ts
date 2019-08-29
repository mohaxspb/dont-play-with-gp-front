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
}
