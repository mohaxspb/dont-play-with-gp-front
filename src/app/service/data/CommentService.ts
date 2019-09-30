import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GpApiService} from '../GpApiService';
import {GpComment} from '../../model/data/GpComment';

@Injectable()
export class CommentService {

  constructor(
    private apiService: GpApiService,
  ) {
  }

  getCommentCountForArticle(articleId: number): Observable<number> {
    return this.apiService.getCommentCountForArticle(articleId);
  }

  getCommentsForArticle(articleId: number, limit: number, offset: number): Observable<GpComment[]> {
    return this.apiService.getCommentsForArticle(limit, offset, articleId);
  }


  getCommentsByUser(userId: number): Observable<GpComment[]> {
    return this.apiService.getCommentsByUser(userId);
  }

  deleteComment(id: number): Observable<boolean> {
    return this.apiService.deleteComment(id);
  }

  createComment(articleId: number, text: string): Observable<Comment> {
    return this.apiService.createComment(articleId, text);
  }
}
