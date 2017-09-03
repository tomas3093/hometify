/**
 * Class representing data structure for default template
 */
export class TemplateData {

    title: string;
    warnings: string[];
    messages: string[];
    successes: string[];
    heading: string;

    /**
     * Constructor with all optional parameters
     * @param {string} title
     * @param {string[]} warnings
     * @param {string[]} messages
     * @param {string[]} successes
     * @param {string} heading
     */
    constructor(title: string = "", warnings: string[] = [], messages: string[] = [],
                successes: string[] = [], heading: string = "") {
        this.title = title;
        this.warnings = warnings;
        this.messages = messages;
        this.successes = successes;
        this.heading = heading;
    }

    /**
     * Adds new warning message to warning list
     * @param {string} warning
     */
    addWarningMsg = function (warning: string) {
        this.warnings.push(warning);
    };

    /**
     * Adds new message to message list
     * @param {string} msg
     */
    addMsg = function (msg: string) {
        this.messages.push(msg);
    };

    /**
     * Adds new success message to success list
     * @param {string} success
     */
    addSuccessMsg = function (success: string) {
        this.successes.push(success);
    };
}