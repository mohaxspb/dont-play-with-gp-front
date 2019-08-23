import {Injectable} from '@angular/core';
import {Language} from '../model/language';
import {Observable, zip} from 'rxjs';
import {GpLanguageService} from './GpLanguageService';
import {GpUserService} from './GpUserService';
import {User} from '../model/user';
import {AuthService} from './auth/auth.service';
import {switchMapTo} from 'rxjs/operators';

@Injectable()
export class GpAccountInteractor {

  constructor(
    private languageService: GpLanguageService,
    private userService: GpUserService,
    private authService: AuthService
  ) {
  }

  getUserAndLanguages(): Observable<[User, Language[]]> {
    return zip(
      this.userService.getUser(),
      this.languageService.getLanguages()
    );
  }

  deleteAccount(id: number): Observable<any> {
    return this.userService
      .delete(id)
      .pipe(switchMapTo(this.authService.logout()));
  }
}
