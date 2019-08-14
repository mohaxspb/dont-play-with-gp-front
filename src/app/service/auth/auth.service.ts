import {Injectable} from '@angular/core';
import {AuthProvider} from './auth.state.subject';
import {UserProvider} from './user.subject';
import {User} from '../../model/user';
import {GpApiService} from '../gp.api.service';
import {Api} from '../Api';
import {SocialProvider} from '../../GpConstants';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';

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

  static socialLogin(provider: SocialProvider) {
    window.location.href = Api.URL + Api.SocialAuthEndpoint.URL + provider.toLowerCase();
  }

  authenticate() {
    console.log('authenticate');
    this.apiService
      .getUser()
      .pipe(
        catchError(() => of(null))
      )
      .subscribe((user: User) => {
        this.onUserReceived(user);
      });
  }

  logout() {
    console.log('logout');
    return this.apiService
      .logout()
      .pipe(
        tap(() => {
          console.log('logout success');
          this.onUserReceived(null);
        })
      );
  }

  getUser(): User | null {
    return this.user;
  }

  login(email: string, password: string) {
    return this.apiService
      .login(email, password)
      .pipe(
        tap(value => this.onUserReceived(value))
      );
  }

  private onUserReceived(user: User | null) {
    console.log('user: ' + JSON.stringify(user));
    this.user = user;
    this.authenticated = this.user != null;
    this.authProvider.authenticated.next(this.authenticated);
    this.userProvider.user.next(this.user);
  }

  register(email: string, password: string, name: string, primaryLanguage: string) {
    return this.apiService
      .register(email, password, name, primaryLanguage)
      .pipe(
        tap(value => this.onUserReceived(value))
      );
  }
}
