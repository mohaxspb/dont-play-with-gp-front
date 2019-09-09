import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * hack from https://stackoverflow.com/a/43172992/3212712
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ngVar]',
})
export class VarDirective {
  @Input()
  set ngVar(context: any) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  context: any = {};

  constructor(private vcRef: ViewContainerRef, private templateRef: TemplateRef<any>) {
  }

  updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
