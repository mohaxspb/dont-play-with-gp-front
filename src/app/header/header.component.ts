import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../service/auth/auth.service';
import {AuthProvider} from '../service/auth/auth.state.subject';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {UserProvider} from '../service/auth/UserProvider';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {GpUser} from '../model/auth/GpUser';
import {LoginComponent} from '../login/login.component';
import {SUPPORTED_LANGUAGES} from '../GpConstants';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title = 'Don\'t play with Google';

  supportedLanguages: string[] = SUPPORTED_LANGUAGES;
  currentSiteLanguage: string = GpLanguageService.DEFAULT_LANG_CODE;

  authenticated: boolean | null;
  user: GpUser | null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private authProvider: AuthProvider,
    private languageService: GpLanguageService,
    private userProvider: UserProvider,
    private bottomSheet: MatBottomSheet
  ) {
    this.authService.authenticate();
    this.languageService.updateLanguages();
  }

  ngOnInit() {
    this.currentSiteLanguage = window.location.pathname
        .replace(new RegExp(environment.pathPrefix, 'g'), '')
        .replace(new RegExp('/', 'g'), '');

    this.authProvider
      .authenticated
      .subscribe((authenticated: boolean) => this.authenticated = authenticated);
    this.userProvider
      .getUser()
      .subscribe((user: GpUser) => this.user = user);
  }

  onLoginClicked() {
    this.bottomSheet.open(LoginComponent);
  }

  onLogoutClicked() {
    this.authService
      .logout()
      .subscribe();
  }

  onAccountClicked() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigateByUrl('account');
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }

  onTitleClicked() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigateByUrl('');
  }

  onAvatarLoadError(event) {
    event.target.src = './assets/baseline-image-24px.svg';
  }

  get langFlag() {
    return './assets/img/flags/' + this.currentSiteLanguage + '.svg';
  }

  getFlagPathForLangCode(langCode: string): string {
    switch (langCode) {
      case 'ru':
      case 'fr':
        return './assets/img/flags/' + langCode + '.svg';
      default:
        return './assets/img/flags/' + GpLanguageService.DEFAULT_LANG_CODE + '.svg';
    }
  }

  onLangClicked(lang: string) {
    this.currentSiteLanguage = lang;

    window.location.href = '/' + lang + '/' + '#' + this.router.url;
  }
}
