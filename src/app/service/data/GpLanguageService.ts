import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GpApiService} from '../GpApiService';
import {GpLocalStorageService} from '../GpLocalStorageService';
import {Language} from '../../model/data/Language';

@Injectable()
export class GpLanguageService {

  public static DEFAULT_LANG_CODE = 'en';

  constructor(
    private apiService: GpApiService,
    private localStorageService: GpLocalStorageService
  ) {
  }

  static getLanguageById(languages: Language[], id: number): Language {
    return languages.find(value => value.id === id);
  }

  static getLanguageByLangCode(languages: [Language], langCode: string): Language | null {
    return languages.find(value => value.langCode === langCode);
  }

  static getEnglish(languages: [Language]): Language {
    return this.getLanguageByLangCode(languages, GpLanguageService.DEFAULT_LANG_CODE);
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

  getDefaultLangCode(): string {
    return this.localStorageService.getDefaultLangCode();
  }

  setDefaultLangCode(langCode: string) {
    this.localStorageService.setDefaultLangCode(langCode);
  }
}
