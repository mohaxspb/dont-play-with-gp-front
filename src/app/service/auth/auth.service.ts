import {Injectable} from '@angular/core';
import {AuthProvider} from './auth.state.subject';
import {UserProvider} from './UserProvider';
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

  register(email: string, password: string, name: string, primaryLanguage: string) {
    return this.apiService
      .register(email, password, name, primaryLanguage)
      .pipe(
        tap(value => this.onUserReceived(value))
      );
  }

  onUserReceived(user: GpUser | null) {
    this.authenticated = user != null;
    this.authProvider.authenticated.next(this.authenticated);
    this.userProvider.call(user);
  }
}
