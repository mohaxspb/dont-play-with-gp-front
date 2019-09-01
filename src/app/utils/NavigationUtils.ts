export class NavigationUtils {

  static scrollToTop() {
    // this will provide smooth animation for the scroll
    // this.sectionNeedToScroll.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
}
