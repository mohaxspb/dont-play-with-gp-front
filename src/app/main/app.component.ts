import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatBottomSheet} from '@angular/material';
import {LoginComponent} from '../login/login.component';
import {AuthService} from '../service/auth/auth.service';
import {AuthProvider} from '../service/auth/auth.state.subject';
import {UserProvider} from '../service/auth/user.subject';
import {User} from '../model/user';
import {GpLanguageService} from '../service/GpLanguageService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dont-play-with-gp-web';

  authenticated: boolean | null;
  user: User | null;

  constructor(
    private route: ActivatedRoute,
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
    console.log('ngOnInit');
    this.authProvider
      .authenticated
      .subscribe((authenticated: boolean) => this.authenticated = authenticated);
    this.userProvider
      .user
      .subscribe((user: User) => this.user = user);
  }

  onLoginClicked() {
    console.log('login clicked!');
    this.bottomSheet.open(LoginComponent);
  }

  onLogoutClicked() {
    console.log('logout clicked!');
    this.authService
      .logout()
      .subscribe();
  }

  onAccountClicked() {
    console.log('onAccountClicked');
    // todo
  }

  isNullOrEmptyOrUndefined(value) {
    return !value;
  }
}
