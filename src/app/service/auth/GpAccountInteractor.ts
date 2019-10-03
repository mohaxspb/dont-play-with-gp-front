import {Injectable} from '@angular/core';
import {Language} from '../../model/data/Language';
import {Observable, zip} from 'rxjs';
import {GpLanguageService} from '../data/GpLanguageService';
import {GpUserService} from './GpUserService';
import {GpUser} from '../../model/auth/GpUser';
import {AuthService} from './auth.service';
import {switchMapTo, tap} from 'rxjs/operators';

@Injectable()
export class GpAccountInteractor {

  constructor(
    private languageService: GpLanguageService,
    private userService: GpUserService,
    private authService: AuthService
  ) {
  }

  getUserAndLanguages(): Observable<[GpUser, Language[]]> {
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

  editAccount(userId: number, name: string, langCode: string): Observable<GpUser> {
    return this.userService
      .updateAccount(userId, name, langCode)
      .pipe(
        tap(user => {
          this.authService.onUserReceived(user);
          this.languageService.setDefaultLangCode(
            GpLanguageService.getLanguageById(
              this.languageService.getLanguagesFromLocalStorage(),
              user.primaryLanguageId
            ).langCode
          );
        })
      );
  }
}
