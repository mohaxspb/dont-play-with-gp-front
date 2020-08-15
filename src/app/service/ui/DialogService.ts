import {Injectable} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {DialogComponent} from '../../dialog/dialog.component';

@Injectable()
export class DialogService {

  constructor(private dialog: MatDialog) {
  }

  public confirm(title: string, message: string, action: string): Observable<boolean> {

    let dialogRef: MatDialogRef<DialogComponent>;

    dialogRef = this.dialog.open(DialogComponent);

    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.action = action;

    return dialogRef.afterClosed();
  }
}
