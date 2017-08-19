"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TemplateData_1 = require("./TemplateData");
/**
 * Data structure for artist-list template
 */
var ArtistListData = (function (_super) {
    __extends(ArtistListData, _super);
    function ArtistListData(title, warnings, messages, successes, heading, items) {
        if (title === void 0) { title = ""; }
        if (warnings === void 0) { warnings = []; }
        if (messages === void 0) { messages = []; }
        if (successes === void 0) { successes = []; }
        if (heading === void 0) { heading = ""; }
        var _this = _super.call(this, title, warnings, messages, successes, heading) || this;
        _this.items = items;
        return _this;
    }
    return ArtistListData;
}(TemplateData_1.TemplateData));
exports.ArtistListData = ArtistListData;
/**
 * Data structure of ArtistList item
 */
var ArtistData = (function () {
    function ArtistData() {
    }
    return ArtistData;
}());
exports.ArtistData = ArtistData;
//# sourceMappingURL=ArtistListData.js.map