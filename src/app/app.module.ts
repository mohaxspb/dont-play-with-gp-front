import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './main/app.component';
import {LoginComponent} from './login/login.component';
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
  MatMenuModule, MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSnackBarModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
// internalization
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeRu from '@angular/common/locales/ru';
// custom
import {AuthService} from './service/auth/auth.service';
import {UserProvider} from './service/auth/user.subject';
import {AuthProvider} from './service/auth/auth.state.subject';
import {GpApiService} from './service/gp.api.service';
import {GpLocalStorage} from './service/GpLocalStorage';
import {GpLanguageService} from './service/GpLanguageService';
import { HeaderComponent } from './header/header.component';

registerLocaleData(localeEn);
registerLocaleData(localeRu);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent
  ],
  entryComponents: [
    LoginComponent
  ],
  imports: [
    RouterModule.forRoot([]),
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
