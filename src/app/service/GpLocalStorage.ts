import {Injectable} from '@angular/core';
import {Language} from '../model/language';

@Injectable()
export class GpLocalStorage {

  static Keys = class {
    static LANGUAGES = 'LANGUAGES';
  };

  constructor() {
  }

  getLanguages(): Language[] | null {
    const rawLanguages = localStorage.getItem(GpLocalStorage.Keys.LANGUAGES);
    if (rawLanguages == null) {
      // rawLanguages = '[]';
      return null;
    }
    return JSON.parse(rawLanguages);
  }

  setLanguages(languages: Language[]) {
    localStorage.setItem(GpLocalStorage.Keys.LANGUAGES, JSON.stringify(languages));
  }
}
