import {Injectable} from '@angular/core';
import {GpApiService} from './GpApiService';
import {Observable} from 'rxjs';
import {User} from '../model/user';

@Injectable()
export class GpUserService {

  constructor(
    private apiService: GpApiService,
  ) {
  }

  getUser(): Observable<User> {
    return this.apiService.getUser();
  }

  delete(id: number): Observable<boolean> {
    return this.apiService.delete(id);
  }
}
