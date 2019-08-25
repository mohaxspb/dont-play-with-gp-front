import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MyErrorStateMatcher} from '../utils/MyErrorStateMatcher';
import {Language} from '../model/data/Language';
import {GpLanguageService} from '../service/GpLanguageService';
import {GpUser} from '../model/auth/GpUser';
import {UserProvider} from '../service/auth/user.subject';
import {GpArticleService} from '../service/GpArticleService';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {

  articleCreateFormGroup: FormGroup;

  matcher = new MyErrorStateMatcher();

  // data from api
  // todo get from api
  languagesListFromApi: Language[];

  // data
  title: string;
  articleLanguage: Language;

  constructor(
    private userProvider: UserProvider,
    private languageService: GpLanguageService,
    private articleService: GpArticleService,
    private fBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    // todo getUser and languages, then init form.
    // also show progressbar
  }

  onPrimaryLanguageChanged(language: Language) {
    console.log('onPrimaryLanguageChanged: %s', JSON.stringify(language));
    this.articleLanguage = language;
  }

  onTitleChanged(title: string) {
    console.log('onTitleChanged: %s', title);
    this.title = title;
  }

  onArticleCreateClicked() {
    console.log('onArticleCreateClicked');
    // todo
  }

  private initForm(user: GpUser, userLanguage: Language) {
    this.articleCreateFormGroup = this.fBuilder.group({
      title: new FormControl(
        {value: null, disabled: false},
        [Validators.required]
      ),
      primaryLanguageSelect: new FormControl(
        {value: userLanguage, disabled: false},
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
}
