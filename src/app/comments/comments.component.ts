import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from '../service/data/CommentService';
import {GpUserService} from '../service/auth/GpUserService';
import {NotificationService} from '../service/ui/NotificationService';
import {DialogService} from '../service/ui/DialogService';
import {MatBottomSheet} from '@angular/material';
import {BehaviorSubject, of} from 'rxjs';
import {GpConstants} from '../GpConstants';
import {GpComment} from '../model/data/GpComment';
import {catchError, finalize} from 'rxjs/operators';
import {UserProvider} from '../service/auth/UserProvider';
import {GpUser} from '../model/auth/GpUser';
import {Article} from '../model/data/Article';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  progressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressErrorOccurred = new BehaviorSubject<boolean>(false);

  user: GpUser | null = null;

  @Input() article: Article;

  noCommentsForArticle = false;
  comments: GpComment[] = [];

  constructor(
    private commentService: CommentService,
    private userService: GpUserService,
    private userProvider: UserProvider,
    private notificationService: NotificationService,
    private dialogsService: DialogService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
    this.loadInitialData();

    // handle user changed
    this.userProvider
      .getUser()
      .subscribe(value => {
        // console.log('this.user !== value: %s', (this.user === null && value !== null) || (this.user !== null && value === null));
        if ((this.user === null && value !== null) || (this.user !== null && value === null)) {
          this.user = value;
        }
      });
  }

  onScroll() {
    this.loadComments(this.comments.length);
  }

  commentsListEndReached(): boolean {
    return this.comments.length % GpConstants.DEFAULT_LIMIT !== 0 || this.noCommentsForArticle;
  }

  loadComments(offset: number = 0) {
    console.log('loadComments: %s', offset);
    if (offset === 0) {
      this.progressInAction.next(true);
    } else {
      this.bottomProgressInAction.next(true);
    }

    this.commentService
      .getCommentsForArticle(this.article.id, GpConstants.DEFAULT_LIMIT, offset)
      .pipe(
        // to test loading indicator
        // delay(1000),
        // to test error
        // flatMap(value => {
        //   if (offset === 4) {
        //     throw Error('test');
        //   } else {
        //     return of(value);
        //   }
        // }),
        finalize(() => {
          if (offset === 0) {
            this.progressInAction.next(false);
          } else {
            this.bottomProgressInAction.next(false);
          }
        })
      )
      .subscribe(
        comments => {
          if (offset === 0) {
            this.comments = comments;
            this.noCommentsForArticle = this.comments.length === 0;
          } else {
            this.bottomProgressErrorOccurred.next(false);
            this.comments = this.comments.concat(comments);
          }
        },
        error => {
          this.notificationService.showError(error);
          this.bottomProgressErrorOccurred.next(true);
        }
      );
  }

  onAvatarLoadError(event) {
    event.target.src = './assets/person-24px.svg';
  }

  private loadInitialData() {
    this.progressInAction.next(true);

    this.userService.getUser().pipe(catchError(() => of(null)))
      .pipe(
        // delay(1000),
        finalize(() => this.loadComments())
      )
      .subscribe(
        value => {
          this.user = value;
        },
        error => this.notificationService.showError(error)
      );
  }
}
