import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../service/auth/auth.service';
import {MatBottomSheet} from '@angular/material';
import {LoginComponent} from '../login/login.component';
import {GpArticleService} from '../service/data/GpArticleService';
import {BehaviorSubject} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {NotificationService} from '../service/ui/NotificationService';
import {Article} from '../model/data/Article';
import {GpConstants} from '../GpConstants';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  progressInAction = new BehaviorSubject<boolean>(false);

  articles: Article[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private articleService: GpArticleService,
    private notificationService: NotificationService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
    this.loadArticles();
  }

  onCreateArticleClicked() {
    console.log('onCreateArticleClicked');
    if (this.authService.authenticated) {
      this.router.navigateByUrl('create-article');
    } else {
      this.bottomSheet.open(LoginComponent, {data: {title: 'To create article you should'}});
    }
  }

  private loadArticles(offset: number = 0) {
    this.progressInAction.next(true);

    this.articleService.getPublishedArticles(GpConstants.DEFAULT_LIMIT, this.articles.length)
      .pipe(
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        articles => {
          this.articles = articles;
        },
        error => this.notificationService.showError(error)
      );
  }
}
