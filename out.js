
const figlet = require('figlet');
const chalk = require('chalk');

const giveColor = (msg, color) => {
    if(typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
}

const log = (msg, color) => {
    console.log(giveColor(msg, color));
}

const bigLog = (msg, color) => {
    log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
}

const errorLog = (emsg) => {
    console.log(`${giveColor("Error", "red")}: ${giveColor(giveColor(emsg, "red"), "bgYellowBright")}`);
};

exports = module.exports = {
    giveColor,
    log,
    bigLog,
    errorLog
};