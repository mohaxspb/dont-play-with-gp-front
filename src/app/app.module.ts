import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './main/app.component';
import { LoginComponent } from './login/login.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MatBottomSheetModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatRippleModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {AuthService} from './service/auth/auth.service';
import {UserProvider} from './service/auth/user.subject';
import {AuthProvider} from './service/auth/auth.state.subject';
import {HttpClientModule} from '@angular/common/http';
import {GpApiService} from './service/api.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
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
    MatRippleModule
  ],
  providers: [GpApiService, AuthService, AuthProvider, UserProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
