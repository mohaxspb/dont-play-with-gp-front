import {Injectable} from '@angular/core';
import {AuthProvider} from './auth.state.subject';
import {UserProvider} from './user.subject';
import {GpUser} from '../../model/auth/GpUser';
import {GpApiService} from '../GpApiService';
import {Api} from '../Api';
import {SocialProvider} from '../../GpConstants';
import {catchError, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Router} from '@angular/router';

@Injectable()
export class AuthService {

  authenticated = false;

  constructor(
    private apiService: GpApiService,
    private authProvider: AuthProvider,
    private userProvider: UserProvider,
    private router: Router
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
      .subscribe((user: GpUser) => {
        this.onUserReceived(user);
      });
  }

  logout(): Observable<string> {
    console.log('logout');
    return this.apiService
      .logout()
      .pipe(
        tap(() => {
          console.log('logout success');
          this.onUserReceived(null);
          this.router.navigateByUrl('');
        })
      );
  }

  login(email: string, password: string): Observable<GpUser> {
    return this.apiService
      .login(email, password)
      .pipe(
        tap(value => this.onUserReceived(value))
      );
  }

  private onUserReceived(user: GpUser | null) {
    console.log('user: ' + JSON.stringify(user));
    this.authenticated = user != null;
    this.authProvider.authenticated.next(this.authenticated);
    this.userProvider.user.next(user);
  }

  register(email: string, password: string, name: string, primaryLanguage: string) {
    return this.apiService
      .register(email, password, name, primaryLanguage)
      .pipe(
        tap(value => this.onUserReceived(value))
      );
  }
}
