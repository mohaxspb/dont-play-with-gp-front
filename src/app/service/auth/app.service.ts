import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthProvider} from './auth.state.subject';
import {UserProvider} from './user.subject';
import {User} from '../../model/user';
import {environment} from '../../../environments/environment';

@Injectable()
export class AppService {

  user: User;

  authenticated = false;

  constructor(
    private http: HttpClient,
    private authProvider: AuthProvider,
    private userProvider: UserProvider
  ) {
  }

  // --proxy-config proxy.conf.json

  authenticate(credentials, callback) {
    // this.http.get<User>("http://" + window.location.hostname + ':8080'+environment.apiPath+'/me', {withCredentials: true})

    let port = '8080';
    if (window.location.protocol === 'https:') {
      port = '8443';
    }

    this.http.get<User>(
      window.location.protocol + '//'
      + window.location.hostname + ':' + port
      + environment.apiPath + '/user/me',
      {withCredentials: true}
    )
      .subscribe(user => {
        this.user = user;
        this.authenticated = this.user != null;

        console.log('AppService user: ', user, this.user);

        this.authProvider.authenticated.next(this.authenticated);
        this.userProvider.user.next(this.user);
        return callback && callback();
      });

    console.log('protocol: ' + window.location.protocol);
    console.log('port: ' + port);
    console.log('url: ' + window.location.protocol + '//'
      + window.location.hostname + ':' + port
      + environment.apiPath + '/user/me'
    );
  }

  getUser() {
    return this.user;
  }
}
