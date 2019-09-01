import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {GpArticleService} from '../service/data/GpArticleService';
import {BehaviorSubject} from 'rxjs';
import {NotificationService} from '../service/NotificationService';
import {finalize} from 'rxjs/operators';
import {Article} from '../model/data/Article';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  dataIsLoading = new BehaviorSubject<boolean>(false);

  articleId: number;

  article: Article;

  constructor(
    private route: ActivatedRoute,
    private articleService: GpArticleService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        this.articleId = parseInt(params.get('articleId'), 0);
        console.log('articleId: ', this.articleId);
        this.loadArticle();
      }
    );
  }

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.loadArticle();
  }

  private loadArticle() {
    console.log('loadArticle');

    this.dataIsLoading.next(true);

    this.articleService.getFullArticleById(this.articleId)
      .pipe(
        finalize(() => this.dataIsLoading.next(false))
      )
      .subscribe(
        (article: Article) => this.article = article,
        error => this.notificationService.showError(error)
      );
  }
}
