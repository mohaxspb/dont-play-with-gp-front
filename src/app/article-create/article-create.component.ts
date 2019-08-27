import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {Language} from '../model/data/Language';
import {GpLanguageService} from '../service/data/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {UserProvider} from '../service/auth/UserProvider';
import {GpArticleService} from '../service/data/GpArticleService';
import {finalize, tap} from 'rxjs/operators';
import {BehaviorSubject, zip} from 'rxjs';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {

  articleCreateFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  // data from api
  dataIsLoading = new BehaviorSubject<boolean>(false);
  languagesListFromApi: Language[];

  // local data
  user: GpUser;

  // article data
  title: string;
  shortDescription: string;
  articleLanguage: Language;

  constructor(
    private languageService: GpLanguageService,
    private userProvider: UserProvider,
    private articleService: GpArticleService,
    private fBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.loadInitialData();
  }

  onPrimaryLanguageChanged(language: Language) {
    console.log('onPrimaryLanguageChanged: %s', JSON.stringify(language));
    this.articleLanguage = language;
  }

  onTitleChanged(title: string) {
    console.log('onTitleChanged: %s', title);
    this.title = title;
  }

  onShortDescriptionChanged(shortDescription: string) {
    console.log('onShortDescriptionChanged: %s', shortDescription);
    this.shortDescription = shortDescription;
  }

  onArticleCreateClicked() {
    console.log('onArticleCreateClicked');
    // todo
  }

  private initForm() {
    this.articleCreateFormGroup = this.fBuilder.group({
      title: new FormControl(
        {value: null, disabled: false},
        [Validators.required]
      ),
      shortDescription: new FormControl(
        {value: null, disabled: false},
        []
      ),
      primaryLanguageSelect: new FormControl(
        {value: null, disabled: false},
        [Validators.required]
      )
    });

    // todo may be we need it to edit article
    // const initialValues = {name: user.fullName, primaryLanguageSelect: userLanguage};
    // this.articleCreateFormGroup.valueChanges.subscribe((changes) => {
    //   for (const prop in changes) {
    //     if (changes.hasOwnProperty(prop)) {
    //       if (changes[prop] === initialValues[prop]) {
    //         this.articleCreateFormGroup.get(prop).markAsPristine();
    //       }
    //     }
    //   }
    // });
  }

  private loadInitialData() {
    this.dataIsLoading.next(true);

    zip<[GpUser, Language[]]>(
      this.userProvider.getNonNullUser(),
      this.languageService.getLanguages()
    )
      .pipe(
        tap((userAndLanguages: [GpUser, Language[]]) => {
          this.user = userAndLanguages[0];
          this.languagesListFromApi = userAndLanguages[1];
        }),
        finalize(() => this.dataIsLoading.next(false))
      )
      .subscribe((userAndLanguages: [GpUser, Language[]]) => {
        console.log('userAndLanguages: %s', JSON.stringify(userAndLanguages));
        // this.user = userAndLanguages[0];
        // this.languagesListFromApi = userAndLanguages[1];
        this.initForm();
      });
  }

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.loadInitialData();
  }
}
