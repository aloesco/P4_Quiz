
const readline = require('readline');

const {log, bigLog, errorLog, giveColor} = require('./out');
const model = require('./model');
const cmds = require('./cmds');
const net = require("net");

net.createServer(socket => {

    console.log("Se ha conectado un cliente desde "+socket.remoteAddress);

    bigLog(socket, 'CORE Quiz', 'blue');

const rl = readline.createInterface({
    input: socket,
    output: socket,
    prompt: giveColor("quiz > ", "blue"),
    completer: (line) => {
    const completions = 'h help list show add delete edit test p play credits q quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line];
    }

});

socket
.on("end" , () => {rl.close(); })
.on("error" , () => {rl.close(); })
rl.prompt();

rl.on('line', (line) => {

    let args = line.split(" ");
let cmd = args[0].toLowerCase().trim();

switch (cmd) {
    case '':
        break;
    case 'h':
    case 'help':
        cmds.helpCommands(socket, rl);
        break;
    case 'list':
        cmds.listCommand(socket, rl);
        break;
    case 'show':
        cmds.showCommand(socket, rl, args[1]);
        break;
    case 'add':
        cmds.addCommand(socket, rl);
        break;
    case 'delete':
        cmds.deleteCommand(socket, rl, args[1]);
        break;
    case 'edit':
        cmds.editCommand(socket, rl, args[1]);
        break;
    case 'test':
        cmds.testCommand(socket, rl, args[1]);
        break;
    case 'p':
    case 'play':
        cmds.playCommand(socket, rl);
        break;
    case 'credits':
        cmds.creditCommand(socket, rl);
        break;
    case 'q':
    case 'quit':
        cmds.quitCommand(socket, rl);
        rl.close();
        break;
    default:
        log(socket, `Comando desconocido: '${giveColor(cmd, 'red')}'`);
        log(socket, `Use ${giveColor('help', 'green')} para ayuda.`);
        rl.prompt();
        break;
}

}).on('close', () => {
    console.log(socket, '¡Hasta pronto!');
});
})

.listen(3030);
