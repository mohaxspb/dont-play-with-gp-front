import {Injectable} from '@angular/core';
import {Language} from '../model/data/Language';
import {Observable, zip} from 'rxjs';
import {GpLanguageService} from './GpLanguageService';
import {GpUserService} from './GpUserService';
import {GpUser} from '../model/auth/GpUser';
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
}
