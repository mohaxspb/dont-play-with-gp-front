import {Injectable} from '@angular/core';
import {GpApiService} from '../GpApiService';
import {Observable} from 'rxjs';
import {GpUser} from '../../model/auth/GpUser';

@Injectable()
export class GpUserService {

  constructor(
    private apiService: GpApiService
  ) {
  }

  getUser(): Observable<GpUser> {
    return this.apiService.getUser();
  }

  delete(id: number): Observable<boolean> {
    return this.apiService.delete(id);
  }
}
