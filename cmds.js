
const {log, bigLog, errorLog, giveColor} = require('./out');
const {models} = require('./model');
const {Sequelize} = require('sequelize');


exports.helpCommands = (socket, rl) => {
    console.log(socket, 'Comandos:');
    console.log(socket, ' h|help - Muestra esta ayuda.');
    console.log(socket, ' list - Listar los quizes existentes.');
    console.log(socket, ' show <id> - Muestra la pregunta y respuesta del quiz indicado.');
    console.log(socket, ' add - Añadir una nueva pregunta con su respuesta correspondiente.');
    console.log(socket, ' delete <id> - Borrar la pregunta y respuesta indicadas.');
    console.log(socket, ' edit <id> - Editar la pregunta y/o respuesta indicada.');
    console.log(socket, ' test <id> - Probar la pregunta indicada.');
    console.log(socket, ' p|play - Jugar.');
    console.log(socket, ' credits - Créditos.');
    console.log(socket, ' q|quit - Salir del juego.');
    rl.prompt();
};

exports.listCommand = (socket, rl) => {
    models.quiz.findAll()
        .then(quizzes => {
        quizzes.forEach(quiz => {
        log(socket, `[${giveColor(quiz.id, 'magenta')}]: ${quiz.question}`);
});
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};

const validarId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id === "undefined"){
        reject(new Error(`Falta el parámetro id.`));
    }else{
        id = parseInt(id);
        if(Number.isNaN(id)){
            reject(new Error(`El valor del parámetro id no es un número`));
        }else{
            resolve(id);
        }
    }
});
};

exports.showCommand = (socket, rl, id) => {
    validarId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }else{
            log(socket, `[${giveColor(quiz.id, 'magenta')}]: ${quiz.question} ${giveColor('=>', 'magenta')} ${quiz.answer}`);
        }
    })
    .catch(error => {
            errorLog(socket, error.message);
    })
    .then(() => {
            rl.prompt();
    });

};

const makeQuestion = (rl, text) => {
    return new Sequelize.Promise( (resolve, reject) => {
        rl.question(giveColor(text, "red"), answer=> {
            resolve(answer.trim());
        });
    });
};

exports.addCommand = (socket, rl) => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
    .then(q => {
        return makeQuestion(rl, "Introduzcala la  respuesta: ")
    .then(a => {
            return{question: q, answer: a};
    });
    })
    .then(quiz => {
        return models.quiz.create(quiz);
    })
    .then(quiz => {
        log(socket, ` ${giveColor('Se ha añadido', 'magenta')}: ${quiz.question} ${giveColor("=>", "magenta")} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorLog(socket, 'El quiz es erroneo: ');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorLog(socket, error.message);
    })
    .then(() => {
            rl.prompt();
    });
};

exports.deleteCommand = (socket, rl, id) => {
    validarId(id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
            errorLog(socket, error.message);
    })
    .then(()=> {
            rl.prompt();
    });
};

exports.editCommand = (socket, rl, id) => {
    validarId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        process.stdout.isTTY && setTimeout(() => { rl.write(quiz.question)},0);
        return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then(q => {
            process.stdout.isTTY && setTimeout(() => { rl.write(quiz.answer)},0);
            return makeQuestion(rl, 'Introduzca la respuesta: ')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
            return quiz.save();
    })
    .then(quiz => {
            log(socket, ` Se ha cambiado el quiz ${giveColor(id, 'magenta')} por : ${quiz.question} ${giveColor("=>", "magenta")} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
            errorLog(socket, "El quiz es erroneo: ");
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
            errorLog(socket, error.message);
    })
    .then(() => {
            rl.prompt();
    });
};

exports.testCommand = (socket, rl, id) => {
    validarId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }else{
            return makeQuestion(rl, quiz.question+": ")
            .then(a => {
                if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
                    log(socket, "Su respuesta es:");
                    log(socket, 'Correcta', 'green');
                    rl.prompt();
                }else{
                    log(socket, "Su respuesta es:");
                    log(socket, 'Incorrecta', 'red');
                    rl.prompt();
                }
            });
        }
    })
    .catch(error => {
        errorLog(socket, error.message);
        rl.prompt();
    });
};

exports.playCommand = (socket, rl) => {
    let score = 0;
    let porpreguntar = [];
    models.quiz.findAll()
    .then(quizzes => {
        quizzes.forEach((quiz, id) => {
            porpreguntar[id] = quiz;
        });
    const playCont = () => {
        if(porpreguntar.length === 0){
            log(socket, `${giveColor('No hay preguntas disponibles', 'red')}`);
            log(socket, "Fin");
            log(socket, `${giveColor('Has tenido', 'cyan')}: ${giveColor(score, 'green')} aciertos`);
            rl.prompt();
        }else{
            let id = Math.round(Math.random()*(porpreguntar.length-1));
            let quiz = porpreguntar[id];
            return makeQuestion(rl, quiz.question+": ")
            .then(a => {
                if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
                    score++;
                    log(socket, 'CORRECTO', 'green');
                    log(socket, 'Lleva ' +score+ ' aciertos', 'green');
                    porpreguntar.splice(id, 1);
                    playCont();
                }else{
                    log(socket, 'INCORRECTO', 'red');
                    log(socket, "Fin");
                    log(socket, `${giveColor('Has tenido', 'cyan')}: ${giveColor(score, 'green')} aciertos`);
                    rl.prompt();
                }
            })
            .catch(error => {
                    errorLog(socket, error.message);
            });
        }
    };
    playCont();
})
.catch(error => {
        errorLog(socket, error.message);
});
};

exports.creditCommand = rl => {
    log(socket, `Práctica realizada por: ${giveColor('Alvaro Escobosa Lopez', 'yellow')}`);
    rl.prompt();
};

exports.quitCommand = (socket, rl) =>{
    rl.close();
    socket.end();
}