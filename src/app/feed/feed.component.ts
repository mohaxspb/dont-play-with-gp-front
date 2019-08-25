import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../service/auth/auth.service';
import {MatBottomSheet} from '@angular/material';
import {LoginComponent} from '../login/login.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
  }

  onCreateArticleClicked() {
    console.log('onCreateArticleClicked');
    if (this.authService.authenticated) {
      this.router.navigateByUrl('create-article');
    } else {
      this.bottomSheet.open(LoginComponent, {data: {title: 'To create article you should'}});
    }
  }
}
