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

  login(email: string, password: string): Observable<User> {
    const formData = new FormData();

    formData.append('username', email);
    formData.append('password', password);
    formData.append(Api.TARGET_URL_PARAMETER, Api.URL + Api.UsersEndpoint.URL + Api.UsersEndpoint.Method.ME);
    return this.http
      .post<User>(
        Api.URL + Api.Method.LOGIN,
        formData,
        {
          withCredentials: true
        }
      );
  }
}
