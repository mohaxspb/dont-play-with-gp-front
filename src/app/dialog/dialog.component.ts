import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog-component',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  title: string;
  message: string;
  action: string;

  constructor(public dialogRef: MatDialogRef<DialogComponent>) {
  }

  ngOnInit() {
  }

}
