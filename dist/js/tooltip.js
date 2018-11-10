"use strict";
var Tooltip = /** @class */ (function () {
    function Tooltip(container, title) {
        this.container = container;
        this.container.attr({
            "data-toggle": "tooltip",
            "data-html": "true",
            title: title,
            "data-placement": "bottom"
        });
        this.build();
    }
    Tooltip.prototype.build = function () {
        this.container.tooltip();
    };
    Tooltip.prototype.dispose = function () {
        this.container.tooltip("dispose");
    };
    Tooltip.prototype.show = function () {
        this.container.tooltip("show");
    };
    Tooltip.prototype.editTitle = function (title) {
        this.dispose();
        this.container.attr("title", title);
        this.build();
        this.show();
    };
    return Tooltip;
}());
//# sourceMappingURL=tooltip.js.map