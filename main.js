
const readline = require('readline');

const {log, bigLog, errorLog, giveColor} = require('./out');
const model = require('./model');
const cmds = require('./cmds');



bigLog('CORE Quiz', 'blue');




const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: giveColor("quiz > ", "blue"),
    completer: (line) => {
        const completions = 'h help list show add delete edit test p play credits q quit'.split(' ');
        const hits = completions.filter((c) => c.startsWith(line));
        // show all completions if none found
        return [hits.length ? hits : completions, line];
    }

});

rl.prompt();

rl.on('line', (line) => {

    let args = line.split(" ");
    let cmd = args[0].toLowerCase().trim();

    switch (cmd) {
        case '':
            break;
        case 'h':
        case 'help':
            cmds.helpCommands(rl);
            break;
        case 'list':
            cmds.listCommand(rl);
            break;
        case 'show':
            cmds.showCommand(rl, args[1]);
            break;
        case 'add':
            cmds.addCommand(rl);
            break;
        case 'delete':
            cmds.deleteCommand(rl, args[1]);
            break;
        case 'edit':
            cmds.editCommand(rl, args[1]);
            break;
        case 'test':
            cmds.testCommand(rl, args[1]);
            break;
        case 'p':
        case 'play':
            cmds.playCommand(rl);
            break;
        case 'credits':
            cmds.creditCommand(rl);
            break;
        case 'q':
        case 'quit':
            cmds.quitCommand(rl);
            rl.close();
            break;
        default:
            log(`Comando desconocido: '${giveColor(cmd, 'red')}'`);
            log(`Use ${giveColor('help', 'green')} para ayuda.`);
            rl.prompt();
            break;
    }

}).on('close', () => {
    console.log('¡Hasta pronto!');
    process.exit(0);
});




