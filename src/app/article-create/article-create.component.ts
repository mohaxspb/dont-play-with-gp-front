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
  articleIsFromAnotherSite = true;

  // article data
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceAuthorName: string | null;
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

  onArticleIsFromAnotherSiteClicked(checked: boolean) {
    console.log('onArticleIsFromAnotherSiteClicked: %s', checked);
    this.articleIsFromAnotherSite = checked;

    // author name is optional
    if (this.articleIsFromAnotherSite) {
      this.articleCreateFormGroup.controls.sourceTitle.setValidators([Validators.required]);
      this.articleCreateFormGroup.controls.sourceUrl.setValidators([Validators.required]);
    } else {
      this.articleCreateFormGroup.controls.sourceTitle.clearValidators();
      this.articleCreateFormGroup.controls.sourceUrl.clearValidators();
    }
    this.articleCreateFormGroup.controls.sourceTitle.updateValueAndValidity();
    this.articleCreateFormGroup.controls.sourceUrl.updateValueAndValidity();
  }

  onSourceTitleChanged(sourceTitle: string) {
    console.log('onSourceTitleChanged: %s', sourceTitle);
    this.sourceTitle = sourceTitle;
  }

  onSourceUrlChanged(sourceUrl: string) {
    console.log('onSourceUrlChanged: %s', sourceUrl);
    this.sourceUrl = sourceUrl;
  }

  onSourceAuthorNameChanged(sourceAuthorName: string) {
    console.log('onSourceAuthorNameChanged: %s', sourceAuthorName);
    this.sourceAuthorName = sourceAuthorName;
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

  onDataRefreshClicked() {
    console.log('onDataRefreshClicked');
    this.loadInitialData();
  }

  onArticleCreateClicked() {
    console.log('onArticleCreateClicked');
    // todo
  }

  private initForm() {
    this.articleCreateFormGroup = this.fBuilder.group({
      articleIsFromAnotherSite: new FormControl(
        {value: true, disabled: false},
        []
      ),
      sourceTitle: new FormControl(
        {value: null, disabled: false},
        [Validators.required]
      ),
      sourceAuthorName: new FormControl(
        {value: null, disabled: false},
        []
      ),
      sourceUrl: new FormControl(
        {value: null, disabled: false},
        [Validators.required]
      ),
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

    this.articleCreateFormGroup.valueChanges.subscribe((changes) => {
      console.log('valueChanges: %s', JSON.stringify(changes));
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
        // console.log('userAndLanguages: %s', JSON.stringify(userAndLanguages));
        this.initForm();
      });
  }
}
