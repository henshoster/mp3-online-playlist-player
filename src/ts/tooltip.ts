//@class Tooltip -> build bootstrap tooltip on element
class Tooltip {
  private container: JQuery<Element>;
  constructor(container: JQuery<Element>, title: string) {
    this.container = container;
    this.container.attr({
      "data-toggle": "tooltip",
      "data-html": "true",
      title: title,
      "data-placement": "bottom"
    });
    this.build();
  }
  build() {
    this.container.tooltip();
  }
  dispose() {
    this.container.tooltip("dispose");
  }
  show() {
    this.container.tooltip("show");
  }
  editTitle(title: string) {
    this.dispose();
    this.container.attr("title", title);
    this.build();
    this.show();
  }
}
