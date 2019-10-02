import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GpApiService} from '../GpApiService';
import {GpLocalStorageService} from '../GpLocalStorageService';
import {Language} from '../../model/data/Language';
import {GpUser} from '../../model/auth/GpUser';

@Injectable()
export class GpLanguageService {

  public static DEFAULT_LANG_CODE = 'en';

  constructor(
    private apiService: GpApiService,
    private localStorageService: GpLocalStorageService
  ) {
  }

  static getLanguageById(languages: Language[], id: number): Language | null {
    const language = languages.find(value => value.id === id);
    return language ? language : null;
  }

  static getLanguageByLangCode(languages: Language[], langCode: string): Language | null {
    const language = languages.find(value => value.langCode === langCode);
    return language ? language : null;
  }

  static getEnglish(languages: Language[]): Language {
    return this.getLanguageByLangCode(languages, GpLanguageService.DEFAULT_LANG_CODE);
  }

  getPreferredLanguageForUser(user: GpUser | null, languages: Language[]): Language {
    let language: Language;
    if (user != null) {
      language = GpLanguageService.getLanguageById(languages, user.primaryLanguageId);
    } else {
      // lang from localStorage. May be null, as it uses browser locale.
      const langFromDefaultLangCode = GpLanguageService.getLanguageByLangCode(
        languages,
        this.getDefaultLangCode()
      );
      if (langFromDefaultLangCode == null) {
        language = GpLanguageService.getEnglish(languages);
      } else {
        language = langFromDefaultLangCode;
      }
    }
    return language;
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

  getLanguagesFromLocalStorage(): Language[] | null {
    return this.localStorageService.getLanguages();
  }

  getDefaultLangCode(): string {
    return this.localStorageService.getDefaultLangCode();
  }

  setDefaultLangCode(langCode: string) {
    this.localStorageService.setDefaultLangCode(langCode);
  }
}
