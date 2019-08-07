import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatBottomSheet} from '@angular/material';
import {LoginComponent} from '../login/login.component';
import {AppService} from '../service/auth/app.service';
import {AuthProvider} from '../service/auth/auth.state.subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dont-play-with-gp-web';

  authenticated = false;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private authProvider: AuthProvider,
    private bottomSheet: MatBottomSheet
  ) {
    this.appService.authenticate(undefined, undefined);
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.authProvider
      .authenticated
      .subscribe((value: boolean) => {
        this.authenticated = value;
        console.log('authProvider authenticated: ' + this.authenticated);
      });
  }

  login() {
    console.log('login clicked!');
    this.bottomSheet.open(LoginComponent);
  }

  logout() {
    console.log('logout clicked!');
    this.appService.logout();
  }
}
