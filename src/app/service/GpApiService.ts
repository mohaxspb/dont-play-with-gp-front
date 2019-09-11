import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {GpUser} from '../model/auth/GpUser';
import {Observable} from 'rxjs';
import {Api} from './Api';
import {environment} from '../../environments/environment';
import {Language} from '../model/data/Language';
import {Article} from '../model/data/Article';
import {ArticleTranslation} from '../model/data/ArticleTranslation';
import {ArticleTranslationVersion} from '../model/data/ArticleTranslationVersion';


@Injectable()
export class GpApiService {

  constructor(private http: HttpClient) {
  }

  getUser(): Observable<GpUser> {
    return this.http
      .get<GpUser>(
        Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.ME,
        {withCredentials: true}
      );
  }

  login(email: string, password: string): Observable<GpUser> {
    const formData = new FormData();

    formData.append('username', email);
    formData.append('password', password);
    formData.append(Api.TARGET_URL_PARAMETER, Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.ME);
    return this.http
      .post<GpUser>(
        Api.URL + Api.Method.LOGIN,
        formData,
        {
          withCredentials: true
        }
      );
  }

  logout(): Observable<string> {
    const params = new HttpParams();
    params.set(Api.TARGET_URL_PARAMETER, Api.URL);
    return this.http.get(
      Api.URL + Api.Method.LOGOUT,
      {
        withCredentials: true,
        params,
        responseType: 'text'
      }
    );
  }

  register(email: string, password: string, name: string, primaryLanguage: string) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('fullName', name);
    formData.append('primaryLanguage', primaryLanguage);
    formData.append('clientId', environment.clientId);
    formData.append(Api.TARGET_URL_PARAMETER, Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.ME);
    return this.http
      .post<GpUser>(
        Api.URL + Api.EmailAuthEndpoint.URL + Api.EmailAuthEndpoint.Method.REGISTER,
        formData,
        {
          withCredentials: true
        }
      );
  }

  getLanguages(): Observable<[Language]> {
    return this.http.get<[Language]>(Api.URL + Api.LanguageEndpoint.URL + Api.LanguageEndpoint.Method.ALL);
  }

  delete(id: number): Observable<boolean> {
    const params = new HttpParams();
    params.set('id', id.toString());
    return this.http
      .delete<boolean>(
        Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.DELETE + '/' + id,
        {
          params,
          withCredentials: true
        },
      );
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(
      Api.URL + Api.ArticleEndpoint.URL + id,
      {
        withCredentials: true
      }
    );
  }

  getFullArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.FULL + id,
      {
        withCredentials: true
      }
    );
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
    const formData = new FormData();
    if (sourceTitle != null) {
      formData.append('sourceTitle', sourceTitle);
    }
    if (sourceAuthorName != null) {
      formData.append('sourceAuthorName', sourceAuthorName);
    }
    if (sourceUrl != null) {
      formData.append('sourceUrl', sourceUrl);
    }
    formData.append('articleLanguageId', languageId.toString());
    formData.append('title', title);
    if (shortDescription != null) {
      formData.append('shortDescription', shortDescription);
    }
    formData.append('text', text);
    // todo image Url
    return this.http
      .post<Article>(
        Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.CREATE,
        formData,
        {
          withCredentials: true
        }
      );
  }

  approveArticle(id: number, approve: boolean): Observable<Article> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.APPROVE,
      formData,
      {
        withCredentials: true
      }
    );
  }

  publishArticle(id: number, publish: boolean): Observable<Article> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.PUBLISH,
      formData,
      {
        withCredentials: true
      }
    );
  }

  approveArticleTranslation(id: number, approve: boolean): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.APPROVE,
      formData,
      {
        withCredentials: true
      }
    );
  }

  publishArticleTranslation(id: number, publish: boolean): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.PUBLISH,
      formData,
      {
        withCredentials: true
      }
    );
  }

  approveArticleTranslationVersion(id: number, approve: boolean): Observable<ArticleTranslationVersion> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<ArticleTranslationVersion>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.APPROVE,
      formData,
      {
        withCredentials: true
      }
    );
  }

  publishArticleTranslationVersion(id: number, publish: boolean): Observable<ArticleTranslationVersion> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<ArticleTranslationVersion>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.PUBLISH,
      formData,
      {
        withCredentials: true
      }
    );
  }

  updateAccount(userId: number, name: string, langCode: string): Observable<GpUser> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('name', name);
    formData.append('langCode', langCode);
    return this.http.post<GpUser>(
      Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.UPDATE,
      formData,
      {
        withCredentials: true
      }
    );
  }

  getArticles(limit: number, offset: number): Observable<Article[]> {
    const params = new HttpParams()
      .append('limit', limit.toString())
      .append('offset', offset.toString());
    return this.http.get<Article[]>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.ALL,
      {
        withCredentials: true,
        params
      }
    );
  }
}
