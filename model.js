
const fs = require("fs");
const preguntas = "quizzes.json";

let quizzes = [
    {
        question: "Tercera letra del abecedario",
        answer: "C"
    },
    {
        question: "Capital de Suecia",
        answer: "Estocolmo"
    },
    {
        question: "Mejor jugador de baloncesto de la historia",
        answer: "Michael Jordan"
    },
    {
        question: "Pico más alto del mundo",
        answer: "Everest"
    }
];

const load = () => {
    fs.readFile(preguntas, (err, data) => {
        if(err){
            if(err.code === "ENOENT"){
                save();
                return;
            }
            throw err;
        }
        let json = JSON.parse(data);
        if(json){
            quizzes = json;
        }
    });
};

const save = () => {
    fs.writeFile(preguntas, JSON.stringify(quizzes), err => {
        if(err){
            throw err;
        }
    });
};

exports.count = () => quizzes.length;

exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

exports.update = (id, question, answer) => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error("El valor del parámetro id no es válido");
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

exports.getByIndex = id => {
    const quiz = quizzes[id];
    if (typeof  quiz === "undefined"){
        throw new Error("El valor del parámetro id no es válido");
    }
    return JSON.parse(JSON.stringify(quiz));
}

exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if (typeof  quiz === "undefined"){
        throw new Error("El valor del parámetro id no es válido");
    }
    quizzes.splice(id, 1);
    save();
}

load();