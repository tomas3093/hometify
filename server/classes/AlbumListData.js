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
 * Data structure for album-list template
 */
var AlbumListData = (function (_super) {
    __extends(AlbumListData, _super);
    function AlbumListData(title, warnings, messages, successes, heading, items) {
        if (title === void 0) { title = ""; }
        if (warnings === void 0) { warnings = []; }
        if (messages === void 0) { messages = []; }
        if (successes === void 0) { successes = []; }
        if (heading === void 0) { heading = ""; }
        var _this = _super.call(this, title, warnings, messages, successes, heading) || this;
        _this.items = items;
        return _this;
    }
    return AlbumListData;
}(TemplateData_1.TemplateData));
exports.AlbumListData = AlbumListData;
/**
 * Data structure of AlbumList item
 */
var AlbumData = (function () {
    function AlbumData() {
    }
    return AlbumData;
}());
exports.AlbumData = AlbumData;
//# sourceMappingURL=AlbumListData.js.map