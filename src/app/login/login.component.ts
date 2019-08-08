import {Component, OnInit} from '@angular/core';
import {AuthService} from '../service/auth/auth.service';
import {SocialProvider} from '../GpConstants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

  onGitHubLoginClicked() {
    this.authService.socialLogin(SocialProvider.GITHUB);
  }

  onVkLoginClicked() {
    this.authService.socialLogin(SocialProvider.VK);
  }

  onFacebookLoginClicked() {
    this.authService.socialLogin(SocialProvider.FACEBOOK);
  }

  onGoogleLoginClicked() {
    this.authService.socialLogin(SocialProvider.GOOGLE);
  }
}
