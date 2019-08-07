import {Component, OnInit} from '@angular/core';
import {SocialProvider} from '../GpConstants';
import {GpApiService} from '../service/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private apiService: GpApiService) {
  }

  ngOnInit() {
  }

  onGitHubLoginClicked() {
    window.location.href =  this.apiService.API_URL + 'oauth2/authorize/' + SocialProvider.GITHUB.toLowerCase();
  }
}
