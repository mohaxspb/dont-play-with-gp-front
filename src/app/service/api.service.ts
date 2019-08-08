import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user';
import {Observable} from 'rxjs';
import {Api} from './Api';


@Injectable()
export class GpApiService {

  constructor(private http: HttpClient) {
  }

  getUser(): Observable<User> {
    return this.http
      .get<User>(
        Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.ME,
        {withCredentials: true}
      );
  }
}
