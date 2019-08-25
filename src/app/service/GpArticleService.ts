import {Injectable} from '@angular/core';
import {GpApiService} from './GpApiService';
import {Observable} from 'rxjs';
import {Article} from '../model/data/Article';

@Injectable()
export class GpArticleService {

  constructor(private apiService: GpApiService) {
  }

  getArticleById(id: number): Observable<Article> {
    return this.apiService.getArticleById(id);
  }
}
