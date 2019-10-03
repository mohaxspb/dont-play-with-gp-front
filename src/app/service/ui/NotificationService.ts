import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {ApiError} from '../../model/ApiError';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar,
    private i18n: I18n) {
  }

  showMessage(message: string) {
    this.snackBar.open(message);
  }

  showError(error: Error) {
    if (error instanceof HttpErrorResponse) {
      console.log('message: %s/%s', error.message, JSON.stringify(error.error));
      try {
        const parsedServerError: ApiError = error.error;
        this.showMessage(parsedServerError.message);
      } catch (e) {
        console.error(e);
        const message = this.i18n({
          value: 'Unexpected error occurred.',
          id: 'unexpectedErrorMessage',
          meaning: 'Unexpected error occurred.',
          description: 'Unexpected error occurred.'
        });
        this.showMessage(message);
      }
    } else {
      console.error('error is instance of: %s', error.constructor.name);
      const message = this.i18n({
        value: 'Unexpected error occurred.',
        id: 'unexpectedErrorMessage',
        meaning: 'Unexpected error occurred.',
        description: 'Unexpected error occurred.'
      });
      this.showMessage(message);
    }
  }
}
