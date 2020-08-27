"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
var CommandParser = /** @class */ (function () {
    function CommandParser() {
        this.regexp = new RegExp("^!pal.*$");
    }
    CommandParser.prototype.parse = function (str) {
        var result = {};
        // Return an empty command if the result wasn't a command
        if (!this.regexp.exec(str)) {
            return result;
        }
        var tokens = str.split(' ');
        // Shift the !pal tag from the tokens
        tokens.shift();
        // If no other arguments were given, interpret it as a help request
        if (tokens.length == 0) {
            tokens.unshift("help");
        }
        // Set the instruction to the first token, then remove the token
        result.instruction = tokens[0];
        tokens.shift();
        // Set the arguments to the rest of the tokens
        result.arguments = tokens;
        return result;
    };
    return CommandParser;
}());
exports.CommandParser = CommandParser;
//# sourceMappingURL=commandparser.js.map