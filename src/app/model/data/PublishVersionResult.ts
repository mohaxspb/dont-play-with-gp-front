import {ArticleTranslationVersion} from './ArticleTranslationVersion';

export class PublishVersionResult {
  updatedVersion: ArticleTranslationVersion;
  unpublishedVersion: ArticleTranslationVersion | null;
}
