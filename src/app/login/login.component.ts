import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  onGitHubLoginClicked() {
    // window.open('http://localhost:8080/api/oauth2/authorize/github');
    window.location.href = 'http://localhost:8080/api/oauth2/authorize/github';
  }
}
