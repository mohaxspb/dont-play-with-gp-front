import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
//
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSnackBarModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
// internalization
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeRu from '@angular/common/locales/ru';
// services
import {AuthService} from './service/auth/auth.service';
import {UserProvider} from './service/auth/user.subject';
import {AuthProvider} from './service/auth/auth.state.subject';
import {GpApiService} from './service/GpApiService';
import {GpLocalStorage} from './service/GpLocalStorage';
import {GpLanguageService} from './service/GpLanguageService';
// components
import {AppComponent} from './main/app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {FeedComponent} from './feed/feed.component';
import {AccountComponent} from './account/account.component';
import {LoginComponent} from './login/login.component';
import {GpUserService} from './service/GpUserService';
import {GpAccountInteractor} from './service/GpAccountInteractor';

registerLocaleData(localeEn);
registerLocaleData(localeRu);

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'feed'},
  {path: 'feed', pathMatch: 'full', component: FeedComponent},
  {path: 'account', pathMatch: 'full', component: AccountComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    FeedComponent,
    AccountComponent
  ],
  entryComponents: [
    LoginComponent
  ],
  imports: [
    RouterModule.forRoot(routes, {useHash: true}),
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
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    GpApiService,
    GpUserService,
    GpAccountInteractor,
    AuthService,
    AuthProvider,
    UserProvider,
    GpLocalStorage,
    GpLanguageService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
