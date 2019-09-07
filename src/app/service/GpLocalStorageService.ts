import {Injectable} from '@angular/core';
import {Language} from '../model/data/Language';
import {LanguageUtils} from '../utils/LanguageUtils';


@Injectable()
export class GpLocalStorageService {

  static Keys = class {
    static LANGUAGES = 'LANGUAGES';
    static DEFAULT_LANG_CODE = 'DEFAULT_LANG_CODE';
    static TARGET_URL = 'TARGET_URL';
  };

  constructor() {
  }

  getLanguages(): Language[] | null {
    const rawLanguages = localStorage.getItem(GpLocalStorageService.Keys.LANGUAGES);
    if (rawLanguages == null) {
      return null;
    }
    return JSON.parse(rawLanguages);
  }

  setLanguages(languages: Language[]) {
    localStorage.setItem(GpLocalStorageService.Keys.LANGUAGES, JSON.stringify(languages));
  }

  setDefaultLangCode(langCode: string) {
    localStorage.setItem(GpLocalStorageService.Keys.DEFAULT_LANG_CODE, langCode);
  }

  getDefaultLangCode(): string {
    let defaultLangCode = localStorage.getItem(GpLocalStorageService.Keys.DEFAULT_LANG_CODE);
    if (defaultLangCode == null) {
      defaultLangCode = LanguageUtils.getBrowserLanguageCode();
      this.setDefaultLangCode(defaultLangCode);
    }
    return defaultLangCode;
  }

  setTargetUrl(targetUrl: string) {
    localStorage.setItem(GpLocalStorageService.Keys.TARGET_URL, targetUrl);
  }

  removeTargetUrl() {
    localStorage.removeItem(GpLocalStorageService.Keys.TARGET_URL);
  }

  getTargetUrl(): string | null {
    return localStorage.getItem(GpLocalStorageService.Keys.TARGET_URL);
  }
}
