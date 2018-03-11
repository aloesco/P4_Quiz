
const {log, bigLog, errorLog, giveColor} = require('./out');
const {models} = require('./model');
const {Sequelize} = require('sequelize');


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
    models.quiz.findAll()
        .then(quizzes => {
        quizzes.forEach(quiz => {
        log(`[${giveColor(quiz.id, 'magenta')}]: ${quiz.question}`);
});
})
.catch(error => {
        errorlog(error.message);
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

exports.showCommand = (rl, id) => {
    validarId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }else{
            log(`[${giveColor(quiz.id, 'magenta')}]: ${quiz.question} ${giveColor('=>', 'magenta')} ${quiz.answer}`);
        }
    })
    .catch(error => {
            errorLog(error.message);
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

exports.addCommand = rl => {
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
        log(` ${giveColor('Se ha añadido', 'magenta')}: ${quiz.question} ${giveColor("=>", "magenta")} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorLog('El quiz es erroneo: ');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorLog(error.message);
    })
    .then(() => {
            rl.prompt();
    });
};

exports.deleteCommand = (rl, id) => {
    validarId(id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
            errorLog(error.message);
    })
    .then(()=> {
            rl.prompt();
    });
};

exports.editCommand = (rl, id) => {
    /*if(typeof id === "undefined"){
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
    }*/
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
            log(` Se ha cambiado el quiz ${giveColor(id, 'magenta')} por : ${quiz.question} ${giveColor("=>", "magenta")} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
            errorLog("El quiz es erroneo: ");
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
            errorLog(error.message);
    })
    .then(() => {
            rl.prompt();
    });
};

exports.testCommand = (rl, id) => {
    validarId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }else{
            return makeQuestion(rl, quiz.question+": ")
            .then(a => {
                if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
                    log("Su respuesta es:");
                    log('Correcta', 'green');
                    rl.prompt();
                }else{
                    log("Su respuesta es:");
                    log('Incorrecta', 'red');
                    rl.prompt();
                }
            });
        }
    })
    .catch(error => {
        errorLog(error.message);
        rl.prompt();
    });
};

exports.playCommand = rl => {
    let score = 0;
    let porpreguntar = [];
    models.quiz.findAll()
    .then(quizzes => {
        quizzes.forEach((quiz, id) => {
            porpreguntar[id] = quiz;
        });
    const playCont = () => {
        if(porpreguntar.length === 0){
            log(`${giveColor('No hay preguntas disponibles', 'red')}`);
            log("Fin");
            log(`${giveColor('Has tenido', 'cyan')}: ${giveColor(score, 'green')} aciertos`);
            rl.prompt();
        }else{
            let id = Math.round(Math.random()*(porpreguntar.length-1));
            let quiz = porpreguntar[id];
            return makeQuestion(rl, quiz.question+": ")
            .then(a => {
                if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
                    score++;
                    log('CORRECTO', 'green');
                    log('Lleva ' +score+ ' aciertos', 'green');
                    porpreguntar.splice(id, 1);
                    playCont();
                }else{
                    log('INCORRECTO', 'red');
                    log("Fin");
                    log(`${giveColor('Has tenido', 'cyan')}: ${giveColor(score, 'green')} aciertos`);
                    rl.prompt();
                }
            })
            .catch(error => {
                    errorLog(error.message);
            });
        }
    };
    playCont();
})
.catch(error => {
        errorLog(error.message);
});
};

exports.creditCommand = rl => {
    log(`Práctica realizada por: ${giveColor('Alvaro Escobosa Lopez', 'yellow')}`);
    rl.prompt();
};

exports.quitCommand = rl =>{
    rl.close();
}