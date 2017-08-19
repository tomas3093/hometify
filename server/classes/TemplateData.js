"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class representing data structure for templates
 */
var TemplateData = (function () {
    /**
     * Constructor with all optional parameters
     * @param {string} title
     * @param {string[]} warnings
     * @param {string[]} messages
     * @param {string[]} successes
     * @param {string} heading
     */
    function TemplateData(title, warnings, messages, successes, heading) {
        if (title === void 0) { title = ""; }
        if (warnings === void 0) { warnings = []; }
        if (messages === void 0) { messages = []; }
        if (successes === void 0) { successes = []; }
        if (heading === void 0) { heading = ""; }
        /**
         * Adds new warning message to warning list
         * @param {string} warning
         */
        this.addWarningMsg = function (warning) {
            this.warnings.push(warning);
        };
        /**
         * Adds new message to message list
         * @param {string} msg
         */
        this.addMsg = function (msg) {
            this.messages.push(msg);
        };
        /**
         * Adds new success message to success list
         * @param {string} success
         */
        this.addSuccessMsg = function (success) {
            this.successes.push(success);
        };
        this.title = title;
        this.warnings = warnings;
        this.messages = messages;
        this.successes = successes;
        this.heading = heading;
    }
    return TemplateData;
}());
exports.TemplateData = TemplateData;
//# sourceMappingURL=TemplateData.js.map