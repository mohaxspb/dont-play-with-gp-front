export class LanguageUtils {
  static getBrowserLanguageCode(): string {
    return window.navigator.language.substr(0, 2);
  }
}
