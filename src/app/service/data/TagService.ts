import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GpApiService} from '../GpApiService';
import {Tag} from '../../model/data/Tag';

@Injectable()
export class TagService {

  constructor(
    private apiService: GpApiService,
  ) {
  }

  getTags(): Observable<Tag[]> {
      return this.apiService.getTags();
  }
}
