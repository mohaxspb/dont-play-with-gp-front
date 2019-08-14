import {Injectable} from '@angular/core';
import {GpApiService} from './gp.api.service';
import {GpLocalStorage} from './GpLocalStorage';
import {tap} from 'rxjs/operators';
import {Language} from '../model/language';

@Injectable()
export class GpLanguageService {

  constructor(
    private apiService: GpApiService,
    private localStorageService: GpLocalStorage
  ) {
  }

  updateLanguages() {
    this.apiService.getLanguages()
      .pipe(
        tap((languages: Language[]) => this.localStorageService.setLanguages(languages))
      )
      .subscribe();
  }

  getOrUpdateLanguages(): Language[] | null {
    const languages = this.localStorageService.getLanguages();
    if (languages == null) {
      this.updateLanguages();
    }
    return languages;
  }
}
