import {Injectable} from '@angular/core';
import {Language} from '../model/language';
import {Observable, zip} from 'rxjs';
import {GpLanguageService} from './GpLanguageService';
import {GpUserService} from './GpUserService';
import {User} from '../model/user';

@Injectable()
export class GpAccountInteractor {

  constructor(
    private languageService: GpLanguageService,
    private userService: GpUserService
  ) {
  }

  getUserAndLanguages(): Observable<[User, Language[]]> {
    return zip(
      this.userService.getUser(),
      this.languageService.getLanguages()
    );
  }
}
