import {Injectable} from '@angular/core';
import {GpApiService} from './GpApiService';
import {GpLocalStorage} from './GpLocalStorage';
import {Language} from '../model/data/Language';
import {Observable, of} from 'rxjs';

@Injectable()
export class GpLanguageService {

  constructor(
    private apiService: GpApiService,
    private localStorageService: GpLocalStorage
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
