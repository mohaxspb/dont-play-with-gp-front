import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  articleId: number;

  constructor(
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        this.articleId = parseInt(params.get('articleId'), 0);
        console.log('articleId: ', this.articleId);
      }
    );
  }

}
