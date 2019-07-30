import {Component, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dont-play-with-gp-web';

  networks = {
    facebook: {width: 600, height: 300},
    // todo check it
    google: {width: 515, height: 490}
  };

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    // check login
    this.route.queryParamMap.subscribe(paramsMap => {
      console.log('code => ', paramsMap.get('code'));
      console.log('code => ', paramsMap.get('state'));
    });
  }

  login() {
    console.log('login clicked!');
    const network = 'facebook';
    const facebookLoginUrl = 'https://www.facebook.com/v4.0/dialog/oauth?' +
      'client_id=' + environment.facebookClientId +
      '&redirect_uri=' + environment.facebookRedirectUrl +
      '&state=state' +
      // '&display=popup' +
      '&display=dialog' +
      '&scope=email' +
      '&response_type=code';
    // window.open(facebookLoginUrl);
    window.location.href = facebookLoginUrl;

    // const options = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,';
    // window.open(
    //   facebookLoginUrl,
    //   // 'targetWindow',
    //   'popup',
    //   options + 'height=' + this.networks[network].height + ',width=' + this.networks[network].width
    // );
  }

  logout() {
    console.log('logout clicked!');
    // todo call server, which will call api to logout user.
  }


  // todo rerequest permissions

  // todo check granted permissions
}
