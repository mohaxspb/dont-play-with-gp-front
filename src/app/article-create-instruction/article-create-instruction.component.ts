import { Component, OnInit } from '@angular/core';
import {ARTICLE_OBJECT_EXAMPLE_FOR_INSTRUCTION} from '../GpConstants';

@Component({
  selector: 'app-article-create-instruction',
  templateUrl: './article-create-instruction.component.html',
  styleUrls: ['./article-create-instruction.component.css']
})
export class ArticleCreateInstructionComponent implements OnInit {

  // instruction
  exampleArticleObject = JSON.parse(ARTICLE_OBJECT_EXAMPLE_FOR_INSTRUCTION);

  constructor() { }

  ngOnInit() {
  }

}
