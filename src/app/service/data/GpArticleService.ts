import {Injectable} from '@angular/core';
import {GpApiService} from '../GpApiService';
import {Observable} from 'rxjs';
import {Article} from '../../model/data/Article';
import {ArticleTranslation} from '../../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../../model/data/ArticleTranslationVersion';
import {Language} from '../../model/data/Language';
import {GpLanguageService} from './GpLanguageService';
import {PublishVersionResult} from '../../model/data/PublishVersionResult';
import {Feed} from '../../model/data/Feed';

@Injectable()
export class GpArticleService {

  constructor(private apiService: GpApiService) {
  }

  static getCorrectLanguageForArticle(article: Article, preferredLanguage: Language, languages: Language[]): Language {
    const preferredTranslation = article.translations.find(value => value.langId === preferredLanguage.id);
    if (preferredTranslation != null) {
      return preferredLanguage;
    } else {
      const english = GpLanguageService.getEnglish(languages);
      if (article.translations.find(value => value.langId === english.id) != null) {
        return english;
      } else {
        return GpLanguageService.getLanguageById(languages, article.originalLangId);
      }
    }
  }

  static getLanguagesFromArticle(article: Article, languages: Language[]): Language[] {
    return article.translations.map(translation => languages.find(lang => translation.langId === lang.id));
  }

  getFullArticleById(id: number): Observable<Article> {
    return this.apiService.getFullArticleById(id);
  }

  createArticle(
    languageId: number,
    sourceTitle: string | null,
    sourceAuthorName: string | null,
    sourceUrl: string | null,
    tags: string[],
    title: string,
    shortDescription: string | null,
    text: string,
    image: File | null,
    imageName: string | null
  ): Observable<Article> {
    return this.apiService
      .createArticle(
        languageId,
        sourceTitle,
        sourceAuthorName,
        sourceUrl,
        tags,
        title,
        shortDescription,
        text,
        image,
        imageName
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

  publishArticleTranslationVersion(id: number, publish: boolean): Observable<PublishVersionResult> {
    return this.apiService.publishArticleTranslationVersion(id, publish);
  }

  getPublishedArticles(limit: number, offset: number, onlyForCurrentDate: boolean): Observable<Feed> {
    return this.apiService.getArticles(limit, offset, onlyForCurrentDate);
  }

  getArticlesByAuthor(authorId: number): Observable<Article[]> {
    return this.apiService.getArticlesByAuthor(authorId);
  }

  deleteArticle(id: number): Observable<boolean> {
    return this.apiService.deleteArticle(id);
  }

  deleteTranslation(id: number): Observable<boolean> {
    return this.apiService.deleteTranslation(id);
  }

  deleteVersion(id: number): Observable<boolean> {
    return this.apiService.deleteVersion(id);
  }

  createVersion(translationId: number, text: string): Observable<ArticleTranslationVersion> {
    return this.apiService.createVersion(translationId, text);
  }

  editVersion(versionId: number, text: string): Observable<ArticleTranslationVersion> {
    return this.apiService.editVersion(versionId, text);
  }

  editTranslation(
    translationId: number,
    langId: number,
    imageFile: File | null,
    imageFileName: string | null,
    title: string,
    shortDescription: string | null
  ): Observable<ArticleTranslation> {
    return this.apiService.editTranslation(translationId, langId, imageFile, imageFileName, title, shortDescription);
  }

  addTranslation(
    articleId: number,
    languageId: number,
    imageFile: File | null,
    imageFileName: string | null,
    title: string,
    shortDescription: string | null,
    text: string
  ): Observable<ArticleTranslation> {
    return this.apiService.addTranslation(
      articleId,
      languageId,
      imageFile,
      imageFileName,
      title,
      shortDescription,
      text
    );
  }

  editArticle(
    articleId: number,
    langId: number,
    sourceUrl: string | null,
    sourceAuthorName: string | null,
    sourceTitle: string | null,
    tags: string[]
  ): Observable<Article> {
    return this.apiService.editArticle(
      articleId,
      langId,
      sourceUrl,
      sourceAuthorName,
      sourceTitle,
      tags
    );
  }

  publishArticleWithDate(id: number, publishDate: string): Observable<Article> {
    return this.apiService.publishArticleWithDate(
      id,
      publishDate
    );
  }
}
