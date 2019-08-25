import {Injectable} from '@angular/core';
import {Language} from '../model/data/Language';

@Injectable()
export class GpLocalStorageService {

  static Keys = class {
    static LANGUAGES = 'LANGUAGES';
  };

  constructor() {
  }

  getLanguages(): Language[] | null {
    const rawLanguages = localStorage.getItem(GpLocalStorageService.Keys.LANGUAGES);
    if (rawLanguages == null) {
      // rawLanguages = '[]';
      return null;
    }
    return JSON.parse(rawLanguages);
  }

  setLanguages(languages: Language[]) {
    localStorage.setItem(GpLocalStorageService.Keys.LANGUAGES, JSON.stringify(languages));
  }
}
