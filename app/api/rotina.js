﻿var templater = require('./htmlTemplate.js');
var nodemailer = require("nodemailer");
var app = require('express')();

const NotificacaoDAO = require('../infra/notificacaoDAO.js')();
const connection = require('../../config/connection.js')();
const util = require('./utils.js');

function sendEMail(destiatario, emailsDeCopia, HTMLDoEmail) {
    date = new Date();
    const transporter = nodemailer.createTransport({
        host: "correio.mctic.gov.br",
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "luis.taira@mctic.gov.br", //Login do email que será utilizado para enviar a mensagem.
            pass: "Mctic@123" //Senha do email.
        },
        tls: { rejectUnauthorized: false }
    });
    var mailOptions = {
        from: 'noreply@mctic.gov.br',
        to: destiatario,
        subject: 'Emendas Parlamentares',
        //text: HTMLDoEmail,
        html: HTMLDoEmail,
        cc: emailsDeCopia //Email para quem será enviado como cópia.
    };

    transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.log("true");
        } else {
            console.log('Email enviado: ' + info.response + '\tHora: ' + new Date().toLocaleTimeString());
        }
    });
}

async function main(resultado, num) {

    arrayDeHTMLDeEmendas = []
    let nomeData
    let diasRestantes

    //Gera o html da emenda com base na data em questao
    switch (num) {
        case 1:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_indicacao_beneficiario))
            }
            nomeData = 'Indicação De Beneficiário'
            diasRestantes = resultado[0].dias_indicacao_beneficiario
            break;

        case 2:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_cadastramento_proposta))
            }
            nomeData = 'Cadastrameto De Proposta'
            diasRestantes = resultado[0].dias_cadastramento_proposta
            break;

        case 3:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_analise_proposta))
            }
            nomeData = 'Análise De Proposta'
            diasRestantes = resultado[0].dias_analise_proposta
            break;

        case 4:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_celebracao_convenio))
            }
            nomeData = 'Celebração De Convenio'
            diasRestantes = resultado[0].dias_celebracao_convenio
            break;

        case 5:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_celebracao_convenio))
            }
            nomeData = 'Celebração de Convenio'
            diasRestantes = resultado[0].dias_celebracao_convenio
            break;

        case 6:
            for (var i = 0; i < resultado.length; i++) {
                arrayDeHTMLDeEmendas.push(templater.geraHTMLDaEmenda(resultado[i].num_emenda, resultado[i].dias_celebracao_convenio))
            }
            nomeData = 'Celebração de Convenio'
            diasRestantes = resultado[0].dias_celebracao_convenio
            break;

        default:
            console.log('lol')
    }

    HTMLDasEmendas = arrayDeHTMLDeEmendas.toString().replace(/,/g, '')//transforma o array em uma string e apaga virgulas

    var HTMLString = templater.geraHTMLDoEmail(
        util.getDateString(),
        nomeData,
        HTMLDasEmendas.toString(),
        diasRestantes,
        nomeData).toString();

    var server = app.listen(3002, () => {
        console.log("Servidor Rodando...");
    })

    await sendEMail(resultado[0].email, resultado[0].email_cc, HTMLString.toString())
    server.close();
}

//Cron notation:
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

async function damn() {
    try {
        var schedule = require('node-schedule');
        var rotina = schedule.scheduleJob('0 0 11 * * *', () => { //Agenda uma função a ser rodada às 11 horas de todo dia
            const con = connection()
            const notificacao = new NotificacaoDAO(con);
            console.log("São 11 horas; " + (new Date).toLocaleString())
            //roda todas as 6 queries e chama a main() somente se receber algum resultado
            for (var i; i <= 6; i++) {
                notificacao.getNotificacao1(async (erro, resultado) => { if (resultado.length != 0) { console.log("diferente de 0"); await main(resultado, i) } })
            }
            con.destroy();
        });
    } catch (err) {
        console.log(err + ' ' + new Date.toLocaleString());
        damn();
    }


}

damn();
