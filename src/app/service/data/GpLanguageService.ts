import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GpApiService} from '../GpApiService';
import {GpLocalStorageService} from '../GpLocalStorageService';
import {Language} from '../../model/data/Language';

@Injectable()
export class GpLanguageService {

  constructor(
    private apiService: GpApiService,
    private localStorageService: GpLocalStorageService
  ) {
  }

  updateLanguages() {
    this.apiService
      .getLanguages()
      .subscribe((languages: Language[]) => this.localStorageService.setLanguages(languages));
  }

  getLanguages(): Observable<Language[]> {
    const languages = this.localStorageService.getLanguages();
    if (languages == null) {
      return this.apiService.getLanguages();
    } else {
      this.updateLanguages();
      return of(languages);
    }
  }
}
