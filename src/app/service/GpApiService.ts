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
import {PublishVersionResult} from '../model/data/PublishVersionResult';
import {Tag} from '../model/data/Tag';
import {GpComment} from '../model/data/GpComment';


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
        {withCredentials: true}
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
        {withCredentials: true}
      );
  }

  getLanguages(): Observable<[Language]> {
    return this.http.get<[Language]>(Api.URL + Api.LanguageEndpoint.URL + Api.LanguageEndpoint.Method.ALL);
  }

  deleteUser(id: number): Observable<boolean> {
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

  getFullArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.FULL + id,
      {withCredentials: true}
    );
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
    formData.append('tags', tags.toString());
    formData.append('title', title);
    if (shortDescription != null) {
      formData.append('shortDescription', shortDescription);
    }
    formData.append('text', text);
    if (image != null) {
      formData.append('image', image);
    }
    if (imageName != null) {
      formData.append('imageName', imageName);
    }
    return this.http
      .post<Article>(
        Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.CREATE,
        formData,
        {withCredentials: true}
      );
  }

  approveArticle(id: number, approve: boolean): Observable<Article> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.APPROVE,
      formData,
      {withCredentials: true}
    );
  }

  publishArticle(id: number, publish: boolean): Observable<Article> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.PUBLISH,
      formData,
      {withCredentials: true}
    );
  }

  approveArticleTranslation(id: number, approve: boolean): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.APPROVE,
      formData,
      {withCredentials: true}
    );
  }

  publishArticleTranslation(id: number, publish: boolean): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.PUBLISH,
      formData,
      {withCredentials: true}
    );
  }

  approveArticleTranslationVersion(id: number, approve: boolean): Observable<ArticleTranslationVersion> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('approve', String(approve));
    return this.http.post<ArticleTranslationVersion>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.APPROVE,
      formData,
      {withCredentials: true}
    );
  }

  publishArticleTranslationVersion(id: number, publish: boolean): Observable<PublishVersionResult> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publish', String(publish));
    return this.http.post<PublishVersionResult>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.PUBLISH,
      formData,
      {withCredentials: true}
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
      {withCredentials: true}
    );
  }

  getArticles(limit: number, offset: number, onlyForCurrentDate: boolean): Observable<Article[]> {
    const params = new HttpParams()
      .append('limit', limit.toString())
      .append('onlyForCurrentDate', onlyForCurrentDate.toString())
      .append('offset', offset.toString());
    return this.http.get<Article[]>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.ALL,
      {
        withCredentials: true,
        params
      }
    );
  }

  getArticlesByAuthor(authorId: number): Observable<Article[]> {
    const params = new HttpParams().append('authorId', authorId.toString());
    return this.http.get<Article[]>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.ALL_BY_AUTHOR_ID,
      {
        withCredentials: true,
        params
      }
    );
  }

  deleteArticle(id: number): Observable<boolean> {
    const params = new HttpParams();
    params.set('id', id.toString());
    return this.http
      .delete<boolean>(
        Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.DELETE + '/' + id,
        {
          params,
          withCredentials: true
        },
      );
  }

  deleteTranslation(id: number): Observable<boolean> {
    const params = new HttpParams();
    params.set('id', id.toString());
    return this.http
      .delete<boolean>(
        Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.DELETE + '/' + id,
        {
          params,
          withCredentials: true
        },
      );
  }

  deleteVersion(id: number): Observable<boolean> {
    const params = new HttpParams();
    params.set('id', id.toString());
    return this.http
      .delete<boolean>(
        Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.DELETE + '/' + id,
        {
          params,
          withCredentials: true
        },
      );
  }

  deleteImageByUserIdAndImageName(userId: number, imageName: string): Observable<boolean> {
    return this.http.delete<boolean>(
      Api.URL + Api.ImageEndpoint.URL + userId + '/' + imageName,
      {withCredentials: true}
    );
  }

  addImage(image: File, imageName: string): Observable<string> {
    const formData = new FormData();
    formData.append('imageName', imageName.toString());
    formData.append('image', image);
    return this.http.post<string>(
      Api.URL + Api.ImageEndpoint.URL + Api.ImageEndpoint.Method.ADD,
      formData,
      {withCredentials: true}
    );
  }

  createVersion(translationId: number, text: string): Observable<ArticleTranslationVersion> {
    const formData = new FormData();
    formData.append('articleTranslationId', translationId.toString());
    formData.append('text', text);
    return this.http.post<ArticleTranslationVersion>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.CREATE,
      formData,
      {withCredentials: true}
    );
  }

  editVersion(versionId: number, text: string): Observable<ArticleTranslationVersion> {
    const formData = new FormData();
    formData.append('versionId', versionId.toString());
    formData.append('text', text);
    return this.http.post<ArticleTranslationVersion>(
      Api.URL + Api.ArticleTranslationVersionEndpoint.URL + Api.ArticleTranslationVersionEndpoint.Method.EDIT,
      formData,
      {withCredentials: true}
    );
  }

  // noinspection DuplicatedCode
  editTranslation(
    translationId: number,
    langId: number,
    imageFile: File | null,
    imageFileName: string | null,
    title: string,
    shortDescription: string | null
  ): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('translationId', translationId.toString());
    formData.append('langId', langId.toString());
    if (imageFile != null) {
      formData.append('imageFile', imageFile);
    }
    if (imageFileName != null) {
      formData.append('imageFileName', imageFileName);
    }
    formData.append('title', title);
    if (shortDescription != null) {
      formData.append('shortDescription', shortDescription);
    }
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.EDIT,
      formData,
      {withCredentials: true}
    );
  }

  // noinspection DuplicatedCode
  addTranslation(
    articleId: number,
    languageId: number,
    imageFile: File,
    imageFileName: string,
    title: string,
    shortDescription: string,
    text: string
  ): Observable<ArticleTranslation> {
    const formData = new FormData();
    formData.append('articleId', articleId.toString());
    formData.append('langId', languageId.toString());
    if (imageFile != null) {
      formData.append('imageFile', imageFile);
    }
    if (imageFileName != null) {
      formData.append('imageFileName', imageFileName);
    }
    formData.append('title', title);
    if (shortDescription != null) {
      formData.append('shortDescription', shortDescription);
    }
    formData.append('text', text);
    return this.http.post<ArticleTranslation>(
      Api.URL + Api.ArticleTranslationEndpoint.URL + Api.ArticleTranslationEndpoint.Method.CREATE,
      formData,
      {withCredentials: true}
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
    const formData = new FormData();
    formData.append('articleId', articleId.toString());
    formData.append('langId', langId.toString());
    if (sourceUrl != null) {
      formData.append('sourceUrl', sourceUrl);
    }
    if (sourceAuthorName != null) {
      formData.append('sourceAuthorName', sourceAuthorName);
    }
    if (sourceTitle != null) {
      formData.append('sourceTitle', sourceTitle);
    }
    formData.append('tags', tags.toString());
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.EDIT,
      formData,
      {withCredentials: true}
    );
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(Api.URL + Api.TagEndpoint.URL + Api.TagEndpoint.Method.ALL);
  }

  publishArticleWithDate(id: number, publishDate: string): Observable<Article> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('publishDate', publishDate);
    return this.http.post<Article>(
      Api.URL + Api.ArticleEndpoint.URL + Api.ArticleEndpoint.Method.PUBLISH_WITH_DATE,
      formData,
      {withCredentials: true}
    );
  }

  getCommentsForArticle(limit: number, offset: number, articleId: number): Observable<GpComment[]> {
    const params = new HttpParams()
      .append('limit', limit.toString())
      .append('offset', offset.toString())
      .append('articleId', articleId.toString());
    return this.http.get<GpComment[]>(
      Api.URL + Api.CommentEndpoint.URL + Api.CommentEndpoint.Method.ALL,
      {
        withCredentials: true,
        params
      }
    );
  }

  getCommentsByUser(userId: number): Observable<GpComment[]> {
    const params = new HttpParams()
      .append('userId', userId.toString());
    return this.http.get<GpComment[]>(
      Api.URL + Api.CommentEndpoint.URL + Api.CommentEndpoint.Method.ALL_BY_AUTHOR_ID,
      {
        withCredentials: true,
        params
      }
    );
  }

  deleteComment(id: number): Observable<boolean> {
    const params = new HttpParams();
    params.set('id', id.toString());
    return this.http
      .delete<boolean>(
        Api.URL + Api.CommentEndpoint.URL + Api.CommentEndpoint.Method.DELETE + '/' + id,
        {
          params,
          withCredentials: true
        },
      );
  }

  createComment(articleId: number, text: string): Observable<Comment> {
    const formData = new FormData();
    formData.append('articleId', articleId.toString());
    formData.append('text', text);
    return this.http.post<Comment>(
      Api.URL + Api.CommentEndpoint.URL + Api.CommentEndpoint.Method.ADD,
      formData,
      {withCredentials: true}
    );
  }

  getCommentCountForArticle(articleId: number): Observable<number> {
    const params = new HttpParams().append('articleId', articleId.toString());
    return this.http.get<number>(
      Api.URL + Api.CommentEndpoint.URL + Api.CommentEndpoint.Method.COUNT_FOR_ARTICLE,
      {params}
    );
  }
}
