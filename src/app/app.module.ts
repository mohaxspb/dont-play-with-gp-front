import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './main/app.component';
import { LoginComponent } from './login/login.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatBottomSheetModule, MatButtonModule, MatListModule, MatToolbarModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {AppService} from './service/auth/app.service';
import {UserProvider} from './service/auth/user.subject';
import {AuthProvider} from './service/auth/auth.state.subject';

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
    BrowserAnimationsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    FlexLayoutModule
  ],
  providers: [AppService, AuthProvider, UserProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
