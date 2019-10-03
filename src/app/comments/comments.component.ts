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
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LoginComponent} from '../login/login.component';
import {Language} from '../model/data/Language';
import {EditorInstance, EditorOption} from 'angular-markdown-editor';
import {AuthorityType} from '../model/auth/Authority';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  bsEditorInstance: EditorInstance;
  editorOptions: EditorOption;

  progressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressInAction = new BehaviorSubject<boolean>(false);
  bottomProgressErrorOccurred = new BehaviorSubject<boolean>(false);
  commentSendInAction = new BehaviorSubject<boolean>(false);

  user: GpUser | null = null;

  @Input() article: Article;
  @Input() preferredLanguage: Language;

  noCommentsForArticle = false;
  comments: GpComment[] = [];

  // comment create
  commentCreateFormGroup: FormGroup;
  commentText: string | null = null;
  commentsCount = 0;

  constructor(
    private commentService: CommentService,
    private userService: GpUserService,
    private userProvider: UserProvider,
    private notificationService: NotificationService,
    private fBuilder: FormBuilder,
    private dialogsService: DialogService,
    private bottomSheet: MatBottomSheet,
    private i18n: I18n
  ) {
  }

  ngOnInit() {
    this.editorOptions = {
      iconlibrary: 'fa',
      onShow: (e) => this.bsEditorInstance = e
    };

    this.commentsCount = this.article.commentsCount;

    this.loadInitialData();

    // handle user changed
    this.userProvider
      .getUser()
      .subscribe(value => {
        if ((this.user === null && value !== null) || (this.user !== null && value === null)) {
          this.user = value;
        }
      });

    this.initCommentCreateForm();
  }

  onScroll() {
    this.loadComments(this.comments.length);
  }

  commentsListEndReached(): boolean {
    return this.comments.length % GpConstants.DEFAULT_LIMIT !== 0 || this.noCommentsForArticle;
  }

  loadComments(offset: number = 0) {
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

  onTextChanged(text: string) {
    this.commentText = text;
  }

  onAvatarLoadError(event) {
    event.target.src = './assets/person-24px.svg';
  }

  onCommentCreateClicked() {
    this.commentSendInAction.next(true);

    this.commentService.createComment(this.article.id, this.commentText)
      .pipe(
        // delay(1000),
        finalize(() => this.commentSendInAction.next(false))
      )
      .subscribe(
        () => {
          this.commentCreateFormGroup.controls.markdownText.setValue(null);
          this.commentText = null;
          this.bsEditorInstance.setContent(null);
          this.comments = [];

          this.loadComments();
          this.updateCommentCount();
        },
        error => this.notificationService.showError(error)
      );
  }

  onLoginClicked() {
    const title = this.i18n({
      value: 'To post comment you should',
      id: 'postCommentLoginTitle',
      meaning: 'to post comment you should',
      description: 'to post comment you should'
    });
    this.bottomSheet.open(LoginComponent, {data: {title}});
  }

  onCommentDeleteClicked(id: number) {
    this.progressInAction.next(true);

    this.commentService
      .deleteComment(id)
      .pipe(
        // delay(1000),
        finalize(() => this.progressInAction.next(false))
      )
      .subscribe(
        () => this.loadComments(),
        error => this.notificationService.showError(error)
      );
  }

  isAdmin(): boolean {
    return this.user != null && this.user.authorities.map(value => value.authority).includes(AuthorityType.ADMIN);
  }

  private loadInitialData() {
    this.progressInAction.next(true);

    this.userService.getUser().pipe(catchError(() => of(null)))
      .pipe(
        // delay(1000),
        finalize(() => this.loadComments())
      )
      .subscribe(
        value => this.user = value,
        error => this.notificationService.showError(error)
      );
  }

  private initCommentCreateForm() {
    this.commentCreateFormGroup = this.fBuilder.group({
      markdownText: new FormControl(null, [Validators.required])
    });
  }

  private updateCommentCount() {
    this.commentService
      .getCommentCountForArticle(this.article.id)
      .subscribe(value => this.commentsCount = value);
  }
}
