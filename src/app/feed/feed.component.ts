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
import {Language} from '../model/data/Language';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {UserProvider} from '../service/auth/UserProvider';
import {GpUser} from '../model/auth/GpUser';
import {ArticleTranslation} from '../model/data/ArticleTranslation';
import {NavigationUtils} from '../utils/NavigationUtils';
import {Api} from '../service/Api';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  progressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressErrorOccurred = new BehaviorSubject<boolean>(false);

  languages: Language[] | null = null;
  user: GpUser | null = null;
  preferredLanguage: Language;

  articlesAndTranslations: [Article, ArticleTranslation][] = [];

  constructor(
    private router: Router,
    private userProvider: UserProvider,
    private authService: AuthService,
    private articleService: GpArticleService,
    private languageService: GpLanguageService,
    private notificationService: NotificationService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
    this.loadInitialData();

    // handle user changed
    this.userProvider
      .getUser()
      .subscribe(value => {
        // console.log('this.user !== value: %s', (this.user === null && value !== null) || (this.user !== null && value === null));
        if ((this.user === null && value !== null) || (this.user !== null && value === null)) {
          this.user = value;
        }
      });
  }

  onCreateArticleClicked() {
    console.log('onCreateArticleClicked');
    if (this.authService.authenticated) {
      // noinspection JSIgnoredPromiseFromCall
      this.router.navigateByUrl('create-article');
    } else {
      this.bottomSheet.open(LoginComponent, {data: {title: 'To create article you should'}});
    }
  }

  onArticleClicked(article: Article, translation: ArticleTranslation) {
    console.log('onArticleClicked: %s/%s', article.id, translation.id);

    this.router
      .navigate(['article/' + article.id], {queryParams: {langId: translation.langId}})
      .then(() => NavigationUtils.scrollToTop());
  }

  correctArticleLanguage(article: Article): Language {
    return GpArticleService.getCorrectLanguageForArticle(article, this.preferredLanguage, this.languages);
  }

  getAvailableArticleLanguages(article: Article): Language[] {
    return GpArticleService.getLanguagesFromArticle(article, this.languages);
  }

  getTranslationForLanguageFromArticle(language: Language, article: Article): ArticleTranslation {
    const translation = article.translations.find(value => value.langId === language.id);
    return translation != null ? translation : article.translations[0];
  }

  onScroll() {
    this.loadArticles(this.articlesAndTranslations.length);
  }

  articlesListEndReached(): boolean {
    return this.articlesAndTranslations.length % GpConstants.DEFAULT_LIMIT !== 0;
  }

  changeTranslationForArticleByLanguage(language: Language, article: Article) {
    const index = this.articlesAndTranslations.findIndex(value => value[0].id === article.id);
    this.articlesAndTranslations[index][1] = this.getTranslationForLanguageFromArticle(language, article);
  }

  getFullImagePath(relativePath: string): string {
    return Api.URL + relativePath;
  }

  loadArticles(offset: number = 0) {
    if (offset === 0) {
      this.progressInAction.next(true);
    } else {
      this.bottomProgressInAction.next(true);
    }

    this.articleService
      .getPublishedArticles(GpConstants.DEFAULT_LIMIT, offset)
      .pipe(
        // to test loading indicator
        // delay(1000),
        // to test error
        // flatMap(value => {
        //   if (offset === 4) {
        //     throw Error('test');
        //   } else {
        //     return of(value);
        //   }
        // }),
        finalize(() => {
          if (offset === 0) {
            this.progressInAction.next(false);
          } else {
            this.bottomProgressInAction.next(false);
          }
        })
      )
      .subscribe(
        articles => {
          this.preferredLanguage = this.languageService.getPreferredLanguageForUser(this.user, this.languages);
          if (offset === 0) {
            this.articlesAndTranslations = this.mapArticlesToArticlesAndTranslation(articles);
          } else {
            this.bottomProgressErrorOccurred.next(false);
            this.articlesAndTranslations = this.articlesAndTranslations.concat(this.mapArticlesToArticlesAndTranslation(articles));
          }
        },
        error => {
          this.notificationService.showError(error);
          this.bottomProgressErrorOccurred.next(true);
        }
      );
  }

  private mapArticlesToArticlesAndTranslation(articles: Article[]): [Article, ArticleTranslation][] {
    return articles
      .map(article => [article, this.getTranslationForLanguageFromArticle(this.preferredLanguage, article)]);
  }

  private loadInitialData() {
    this.progressInAction.next(true);

    this.languageService.getLanguages()
      .pipe(
        // delay(1000),
        finalize(() => this.loadArticles())
      )
      .subscribe(
        value => this.languages = value,
        error => this.notificationService.showError(error)
      );
  }
}
