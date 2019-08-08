import {Injectable} from '@angular/core';
import {AuthProvider} from './auth.state.subject';
import {UserProvider} from './user.subject';
import {User} from '../../model/user';
import {GpApiService} from '../api.service';
import {Api} from '../Api';
import {SocialProvider} from '../../GpConstants';

@Injectable()
export class AuthService {

  user: User | null;

  authenticated = false;

  constructor(
    private apiService: GpApiService,
    private authProvider: AuthProvider,
    private userProvider: UserProvider
  ) {
  }

  authenticate() {
    console.log('authenticate');
    this.apiService.getUser()
      .subscribe((user: User) => {
        this.user = user;
        this.authenticated = this.user != null;
        this.authProvider.authenticated.next(this.authenticated);
        this.userProvider.user.next(this.user);
      });
  }

  socialLogin(provider: SocialProvider) {
    window.location.href = Api.URL + Api.SocialAuthEndpoint.URL + provider.toLowerCase();
  }

  logout() {
    console.log('logout');
    window.location.href = Api.URL + Api.Method.LOGOUT;
  }

  getUser(): User | null {
    return this.user;
  }
}
