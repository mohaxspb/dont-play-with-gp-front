import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
//
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatAutocompleteModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
// internalization
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeRu from '@angular/common/locales/ru';
// services
import {AuthService} from './service/auth/auth.service';
import {UserProvider} from './service/auth/UserProvider';
import {AuthProvider} from './service/auth/auth.state.subject';
import {GpApiService} from './service/GpApiService';
import {GpLocalStorageService} from './service/GpLocalStorageService';
import {GpLanguageService} from './service/data/GpLanguageService';
import {GpArticleService} from './service/data/GpArticleService';
// components
import {AppComponent} from './main/app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {FeedComponent} from './feed/feed.component';
import {AccountComponent} from './account/account.component';
import {LoginComponent} from './login/login.component';
import {GpUserService} from './service/auth/GpUserService';
import {GpAccountInteractor} from './service/auth/GpAccountInteractor';
import {DialogComponent} from './dialog/dialog.component';
import {DialogService} from './service/ui/DialogService';
import {ArticleComponent} from './article/article.component';
import {ArticleCreateComponent} from './article-create/article-create.component';
import {AngularMarkdownEditorModule} from 'angular-markdown-editor';
import {MarkdownModule} from 'ngx-markdown';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {MaterialFileInputModule} from 'ngx-material-file-input';
import {TagService} from './service/data/TagService';
import {CommentService} from './service/data/CommentService';
import {CommentsComponent} from './comments/comments.component';
import {ArticleCreateInstructionComponent} from './article-create-instruction/article-create-instruction.component';
// Import the service
import {I18n} from '@ngx-translate/i18n-polyfill';

// need this for markdown lib
// import * as $ from 'jquery';
// noinspection JSUnusedLocalSymbols
declare let $: any;

registerLocaleData(localeEn);
registerLocaleData(localeRu);

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'feed'},
  {path: 'feed', pathMatch: 'full', component: FeedComponent},
  {path: 'account', pathMatch: 'full', component: AccountComponent},
  {path: 'create-article', pathMatch: 'full', component: ArticleCreateComponent},
  {path: 'article/:articleId', pathMatch: 'full', component: ArticleComponent},
];

declare const require; // Use the require method provided by webpack

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    FeedComponent,
    AccountComponent,
    DialogComponent,
    ArticleComponent,
    ArticleCreateComponent,
    CommentsComponent,
    ArticleCreateInstructionComponent
  ],
  entryComponents: [
    LoginComponent,
    DialogComponent
  ],
  imports: [
    RouterModule.forRoot(routes, {useHash: true}),
    MarkdownModule.forRoot(),
    AngularMarkdownEditorModule.forRoot({iconlibrary: 'fa'}),
    InfiniteScrollModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    FlexLayoutModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    FormsModule,
    MaterialFileInputModule,
    MatExpansionModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  providers: [
    GpLocalStorageService,
    GpApiService,
    GpUserService,
    GpAccountInteractor,
    AuthService,
    AuthProvider,
    UserProvider,
    GpArticleService,
    GpLanguageService,
    TagService,
    CommentService,
    DialogService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    I18n,
    //todo try it https://blog.angulartraining.com/how-to-internationalize-i18n-your-angular-application-tutorial-dee2c6984bc1
    {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'},
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        console.log('locale: %s', locale);
        if (!locale || locale.includes('en')) {
          return '';
        } else {
          return require(`raw-loader!../locale/messages.${locale.substring(0, 2)}.xlf`).default;
        }
      },
      deps: [LOCALE_ID]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
