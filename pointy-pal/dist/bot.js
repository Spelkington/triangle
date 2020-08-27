"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
var discord_js_1 = require("discord.js");
var commandparser_1 = require("./services/commandparser");
var classmanager_1 = require("./services/classmanager");
var Bot = /** @class */ (function () {
    function Bot() {
        this.client = new discord_js_1.Client();
        this.commandParser = new commandparser_1.CommandParser();
        this.courseManager = new classmanager_1.CourseManager(this.client);
    }
    Bot.prototype.listen = function () {
        var _this = this;
        this.client.on('ready', function () {
            console.log("Logged in as " + "Somebody!" + "!");
            _this.courseManager.initialize(_this.client);
            return;
        });
        this.client.on('message', function (msg) {
            console.log("Message received: " + msg.content);
            var command = _this.commandParser.parse(msg.content);
            if (!command.instruction) {
                console.log("Message was not a command.");
                return;
            }
            command.user = msg.author;
            command.channel = msg.channel;
            console.log("Message was a command!");
            console.log("\tUser: " + command.user.tag);
            console.log("\tChannel: " + command.channel.id);
            console.log("\tInstruction: " + command.instruction);
            console.log("\tArguments: " + command.arguments);
            switch (command.instruction) {
                case "add-class":
                    _this.courseManager.command(command);
                    break;
                case "remove-class":
                    _this.courseManager.command(command);
                    break;
                default:
                    console.log("Instruction " + command.instruction + " was not recognized.");
            }
        });
        return this.client.login(process.env.TOKEN);
    };
    return Bot;
}());
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map