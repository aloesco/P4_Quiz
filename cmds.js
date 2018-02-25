
const {log, bigLog, errorLog, giveColor} = require('./out');
const model = require('./model');


exports.helpCommands = rl => {
    console.log('Comandos:');
    console.log(' h|help - Muestra esta ayuda.');
    console.log(' list - Listar los quizes existentes.');
    console.log(' show <id> - Muestra la pregunta y respuesta del quiz indicado.');
    console.log(' add - Añadir una nueva pregunta con su respuesta correspondiente.');
    console.log(' delete <id> - Borrar la pregunta y respuesta indicadas.');
    console.log(' edit <id> - Editar la pregunta y/o respuesta indicada.');
    console.log(' test <id> - Probar la pregunta indicada.');
    console.log(' p|play - Jugar.');
    console.log(' credits - Créditos.');
    console.log(' q|quit - Salir del juego.');
    rl.prompt();
};

exports.listCommand = rl => {
    model.getAll().forEach((quiz, id) => {
        log(`[${giveColor(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

exports.showCommand = (rl, id) => {
    if(typeof id === "undefined"){
        errorLog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(`[${giveColor(id, 'magenta')}]: ${quiz.question} ${giveColor('=>', 'magenta')} ${quiz.answer}`);
        }catch(error){
            errorLog(error.message);
        }
    }
    rl.prompt();
};

exports.addCommand = rl => {
    rl.question(giveColor('Introduce una pregunta: ', 'red'), question => {
        rl.question(giveColor('Introduce la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(`${giveColor('Se ha añadido', 'magenta')}: ${question} ${giveColor('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

exports.deleteCommand = (rl, id) => {
    if(typeof id === "undefined"){
        errorLog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorLog(error.message);
        }
    }
    rl.prompt();
};

exports.editCommand = (rl, id) => {
    if(typeof id === "undefined"){
        errorLog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            rl.question(giveColor('Introduce una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                rl.question(giveColor('Introduce la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`${giveColor('Se ha cambiado una pregunta. Ahora es', 'magenta')}: ${question} ${giveColor('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        }catch(error){
            errorLog(error.message);
            rl.prompt();
        }
    }
};

exports.testCommand = (rl, id) => {
    if(typeof id === "undefined"){
        errorLog(`Falta el parámetro id.`);
        rl.prompt();
    }else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(log(`${giveColor(quiz.question, 'red')}`), answer => {
                if(quiz.answer === answer){
                bigLog('acierto', 'green');
                rl.prompt();
            }else{
                bigLog('fallo', 'red');
                rl.prompt();
            }
        });
        } catch (error) {
            errorLog(error.message);
            rl.prompt();
        }
    }
};

exports.playCommand = rl => {
    let score = 0;
    let porpreguntar = [];
    for(var i=0; i<model.count(); i++){
        porpreguntar[i] = model.getByIndex(i);
    }
    const playCont = () => {
        if(porpreguntar.length === 0){
            log(`${giveColor('No hay preguntas disponibles', 'red')}`);
            log(`${giveColor('Has tenido', 'red')}: ${giveColor(score, 'green')} aciertos`);
            rl.prompt();
        }else{
            let azar = Math.random()*(porpreguntar.length-1);
            let id = Math.round(azar);
            let quiz = porpreguntar[id];
            rl.question(log(`${giveColor(quiz.question, 'red')}`), answer => {
                if(quiz.answer === answer){
                    bigLog('correcto', 'green');
                    score++;
                    porpreguntar.splice(id, 1);
                    playCont();
                }else{
                    bigLog('incorrecto', 'red');
                    log(`${giveColor('Has tenido', 'red')}: ${giveColor(score, 'green')} aciertos`);
                    rl.prompt();
                }
            });
        }
    }
    playCont();
};

exports.creditCommand = rl => {
    log(`Práctica realizada por: ${giveColor('Alvaro Escobosa Lopez y Javier Martinez Teba', 'yellow')}`);
    rl.prompt();
};

exports.quitCommand = rl => {
    rl.close();
};