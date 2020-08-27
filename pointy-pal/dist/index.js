"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var bot_1 = require("./bot");
var bot = new bot_1.Bot();
bot.listen().then(function () {
    console.log('Logged in!');
}).catch(function (error) {
    console.log("ERROR: ", error);
});
//# sourceMappingURL=index.js.map