require('dotenv').config();
import {Bot} from "./bot";

let bot = new Bot();

bot.listen().then(() => {

    console.log('Logged in!');

}).catch((error) => {

    console.log("ERROR: ", error);

})