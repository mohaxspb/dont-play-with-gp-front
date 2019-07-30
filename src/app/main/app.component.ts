import {Component} from '@angular/core';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dont-play-with-gp-web';

  login() {
    console.log('login clicked!');
    const facebookLoginUrl = 'https://www.facebook.com/v4.0/dialog/oauth?' +
      'client_id=' + environment.facebookClientId +
      '&redirect_uri=' + environment.facebookRedirectUrl +
      // todo
      '&state={state-param}';
    // window.open(facebookLoginUrl);
    window.location.href = facebookLoginUrl;
  }
}
