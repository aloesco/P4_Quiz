
const figlet = require('figlet');
const chalk = require('chalk');

const giveColor = (msg, color) => {
    if(typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
}

const log = (socket, msg, color) => {
    socket.write(giveColor(msg, color) + "\n");
}

const bigLog = (socket, msg, color) => {
    log(socket, figlet.textSync(msg, {horizontalLayout: 'full'}), color);
}

const errorLog = (socket, emsg) => {
    socket.write(`${giveColor("Error", "red")}: ${giveColor(giveColor(emsg, "red"), "bgYellowBright")}\n`);
};

exports = module.exports = {
    giveColor,
    log,
    bigLog,
    errorLog
};