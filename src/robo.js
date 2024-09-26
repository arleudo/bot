const wppconnect = require("@wppconnect-team/wppconnect");
const firebasedb = require("./firebase.js");
const { messaging } = require("firebase-admin");
const { getSheetData } = require("./googleSheets.js");
const config = require("../arquivo.json");

var userStages = [];
var controller = [];
var controllerMenu = [];
var controllerSubMenu = [];
var controllerSubSubMenu = [];
var section = [];
var subSection = [];
var subSubSection = [];
var inicializador = [];

var resultadoBuscaCPF = null;

wppconnect
  .create({
    session: "whatsbot",
    autoClose: false,
    headless: true,
    puppeteerOptions: { args: ["--no-sandbox"] },
  })
  .then((client) =>
    client.onMessage((message) => {
      if (message.isGroupMsg == false || message.isMMS == false) {
        if (
          inicializador[message.from] == undefined &&
          (message.body === "Ola" ||
            message.body === "ola" ||
            message.body === "Olá" ||
            message.body === "olá")
        ) {
          console.log("Mensagem digitada: " + message.body);
          queryUserByPhone(client, message);
          inicializador[message.from] = "inicio";
        } else if (inicializador[message.from] != undefined) {
          console.log("Mensagem digitada: " + message.body);
          queryUserByPhone(client, message);
        }
      }
    })
  )
  .catch((error) => console.log(error));

async function queryUserByPhone(client, message) {
  let phone = message.from.replace(/[^\d]+/g, "");
  let userdata = await firebasedb.queryByPhone(phone);
  if (userdata == null) {
    userdata = await saveUser(message);
  }
  console.log("Nome: " + userdata["pushname"]);
  stages(client, message, userdata);
}

async function stages(client, message, userdata) {
  if (userStages[message.from] == undefined) {
    exibirBoasVindas(client, message);
    userStages[message.from] = "inicio";
  } else if (controller[message.from] == undefined) {
    controller[message.from] = message.body;
  }

  if (controller[message.from] == "1") {
    secaoProtocolo(client, message);
  } else if (controller[message.from] == "2") {
    secaoAssistencia(client, message);
  } else if (controller[message.from] == "3") {
    secaoCursos(client, message);
  } else if (controller[message.from] == "4") {
    secaoOutros(client, message);
  } else if (controller[message.from] == "5") {
    encerrarChat(client, message);
  } else if (controller[message.from] != undefined) {
    exibirMenu(client, message);
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe uma das opções do menu abaixo."
    );
    controller[message.from] = undefined;
  }
}

function secaoProtocolo(client, message) {
  if (section[message.from] == undefined) {
    exibirMenuProtocolo(client, message);
    section[message.from] = "inicio";
  } else if (controllerMenu[message.from] == undefined) {
    controllerMenu[message.from] = message.body;
  }

  if (
    controllerMenu[message.from] == "a" ||
    controllerMenu[message.from] == "A"
  ) {
    subsecaoNumeroMatricula(client, message);
  } else if (
    controllerMenu[message.from] == "b" ||
    controllerMenu[message.from] == "B"
  ) {
    subsecaoTrancamento_Reabertura(client, message);
  } else if (
    controllerMenu[message.from] == "c" ||
    controllerMenu[message.from] == "C"
  ) {
    subsecaoEmissaoDocumento(client, message);
  } else if (
    controllerMenu[message.from] == "d" ||
    controllerMenu[message.from] == "D"
  ) {
    subsecaoJustificativaFalta(client, message);
  } else if (
    controllerMenu[message.from] == "e" ||
    controllerMenu[message.from] == "E"
  ) {
    subsecaoAndamentoProcessos(client, message);
  } else if (
    controllerMenu[message.from] == "f" ||
    controllerMenu[message.from] == "F"
  ) {
    encerrarChat(client, message);
  } else if (controllerMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
  } else {
    if (controllerMenu[message.from] != undefined) {
      exibirMenuProtocolo(client, message);
      sendWppMessage(
        client,
        message.from,
        "Opção inválida! Por favor informe umas das opções de *Protocolo* abaixo."
      );
      controllerMenu[message.from] = undefined;
    }
  }
}

async function subsecaoNumeroMatricula(client, message) {
  if (subSection[message.from] == undefined) {
    exibirSubMenu(
      client,
      message,
      "*[Número de Matrícula]*\nDigite uma das opções abaixo: ",
      "\n3 - Para Informar um CPF para consulta"
    );
    subSection[message.from] = "inicio";
  } else if (controllerSubMenu[message.from] == undefined) {
    controllerSubMenu[message.from] = message.body;
  }

  if (controllerSubMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    subSection[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "3") {
    subSubSecaoNumeroMatricula(client, message);
  } else if (controllerSubMenu[message.from] != undefined) {
    exibirSubMenu(client, message, "*[Número de Matrícula]*", "");
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Número de Matrícula* abaixo."
    );
    controllerSubMenu[message.from] = undefined;
  }
}

function subsecaoTrancamento_Reabertura(client, message) {
  if (subSection[message.from] == undefined) {
    exibirSubMenu(client, message, "*[Trancamento/Reabertura de curso]*", "");
    subSection[message.from] = "inicio";
  } else if (controllerSubMenu[message.from] == undefined) {
    controllerSubMenu[message.from] = message.body;
  }

  if (controllerSubMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    subSection[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] != undefined) {
    exibirSubMenu(client, message, "*[Trancamento/Reabertura de curso]*", "");
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Trancamento/Reabertura de curso* abaixo."
    );
    controllerSubMenu[message.from] = undefined;
  }
}

function subsecaoEmissaoDocumento(client, message) {
  if (subSection[message.from] == undefined) {
    exibirSubMenu(client, message, "*[Emissão de documentos]*", "");
    subSection[message.from] = "inicio";
  } else if (controllerSubMenu[message.from] == undefined) {
    controllerSubMenu[message.from] = message.body;
  }

  if (controllerSubMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    subSection[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] != undefined) {
    exibirSubMenu(client, message, "*[Emissão de documentos]*", "");
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Emissão de Documentos* abaixo."
    );
    controllerSubMenu[message.from] = undefined;
  }
}

function subsecaoJustificativaFalta(client, message) {
  if (subSection[message.from] == undefined) {
    exibirSubMenu(client, message, "*[Justificativa de Falta]*", "");
    subSection[message.from] = "inicio";
  } else if (controllerSubMenu[message.from] == undefined) {
    controllerSubMenu[message.from] = message.body;
  }

  if (controllerSubMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    subSection[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] != undefined) {
    exibirSubMenu(client, message, "*[Justificativa de Falta]*", "");
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Justificativa de Falta* abaixo."
    );
    controllerSubMenu[message.from] = undefined;
  }
}

function subsecaoAndamentoProcessos(client, message) {
  if (subSection[message.from] == undefined) {
    exibirSubMenu(client, message, "*[Andamento de Processos]*", "");
    subSection[message.from] = "inicio";
  } else if (controllerSubMenu[message.from] == undefined) {
    controllerSubMenu[message.from] = message.body;
  }

  if (controllerSubMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    subSection[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerSubMenu[message.from] != undefined) {
    exibirSubMenu(client, message, "*[Andamento de Processos]*", "");
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Andamento de Processos* abaixo."
    );
    controllerSubMenu[message.from] = undefined;
  }
}

function secaoAssistencia(client, message) {
  if (section[message.from] == undefined) {
    exibirMenuAssistencia(client, message);
    section[message.from] = "inicio";
  } else if (controllerMenu[message.from] == undefined) {
    controllerMenu[message.from] = message.body;
  }

  if (controllerMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
  } else if (controllerMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerSubMenu[message.from] == "2") {
    exibirMenuProtocolo(client, message);
    subSection[message.from] = undefined;
    controllerMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  } else if (controllerMenu[message.from] != undefined) {
    exibirMenuAssistencia(client, message);
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Assistência Estudantil* abaixo."
    );
    controllerMenu[message.from] = undefined;
  }
}

function secaoCursos(client, message) {
  if (section[message.from] == undefined) {
    sendWppMessage(client, message.from, "Só um momento...");
    exibirMenuCursos(client, message);
    section[message.from] = "inicio";
  } else if (controllerMenu[message.from] == undefined) {
    controllerMenu[message.from] = message.body;
  }

  if (controllerMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
  } else if (controllerMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerMenu[message.from] != undefined) {
    sendWppMessage(
      client,
      message.from,
      "0 - Para voltar ao menu principal \n1 - Para encerrar o chat"
    );
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Cursos e Formas de Ingresso* abaixo."
    );
    controllerMenu[message.from] = undefined;
  }
}

function secaoOutros(client, message) {
  if (section[message.from] == undefined) {
    exibirMenuOutros(client, message);
    section[message.from] = "inicio";
  } else if (controllerMenu[message.from] == undefined) {
    controllerMenu[message.from] = message.body;
  }

  if (
    controllerMenu[message.from] == "a" ||
    controllerMenu[message.from] == "A"
  ) {
    sendContact(client, message, 1);
    sendWppMessage(client, message.from, "Te ajudo em algo mais?");
    exibirMenuOutros(client, message);
  } else if (
    controllerMenu[message.from] == "b" ||
    controllerMenu[message.from] == "B"
  ) {
    sendContact(client, message, 2);
    sendWppMessage(client, message.from, "Te ajudo em algo mais?");
    exibirMenuOutros(client, message);
  } else if (
    controllerMenu[message.from] == "c" ||
    controllerMenu[message.from] == "C"
  ) {
    sendContact(client, message, 3);
    sendWppMessage(client, message.from, "Te ajudo em algo mais?");
    exibirMenuOutros(client, message);
  } else if (
    controllerMenu[message.from] == "d" ||
    controllerMenu[message.from] == "D"
  ) {
    sendContact(client, message, 4);
    sendWppMessage(client, message.from, "Te ajudo em algo mais?");
    exibirMenuOutros(client, message);
  } else if (controllerMenu[message.from] == "0") {
    exibirMenu(client, message);
    section[message.from] = undefined;
    controller[message.from] = undefined;
    controllerMenu[message.from] = undefined;
  } else if (controllerMenu[message.from] == "1") {
    encerrarChat(client, message);
  } else if (controllerMenu[message.from] != undefined) {
    exibirMenuOutros(client, message);
    sendWppMessage(
      client,
      message.from,
      "Opção inválida! Por favor informe umas das opções de *Outros* abaixo."
    );
    controllerMenu[message.from] = undefined;
  }
}

async function subSubSecaoNumeroMatricula(client, message) {
  if (subSubSection[message.from] == undefined) {
    sendWppMessage(client, message.from, "Informe seu CPF (apenas números): ");
    subSubSection[message.from] = "inicio";
  } else if (controllerSubSubMenu[message.from] == undefined) {
    controllerSubSubMenu[message.from] = message.body;
  }

  if (controllerSubSubMenu[message.from] != undefined) {
    // AQUI SERÁ FEITA A BUSCA DE MATRÍCULA DO ALUNO
    const result = await searchCPF(controllerSubSubMenu[message.from]);
    exibirSubMenu(
      client,
      message,
      "Te ajudo em algo mais? \n*[Número de Matrícula]*\nDigite uma das opções abaixo: ",
      "\n3 - Para Informar um CPF para consulta"
    );
    sendWppMessage(client, message.from, result);
    subSubSection[message.from] = undefined;
    controllerSubSubMenu[message.from] = undefined;
    controllerSubMenu[message.from] = undefined;
  }
}

function exibirBoasVindas(client, message) {
  sendWppMessage(
    client,
    message.from,
    "Olá sou o chatbot do IFCE do campus Tabuleiro do Norte \nPara agilizar o processo do que você deseja, me informe uma das opções abaixo: \n1 - *Protocolo* (Número de matrícula, Trancamento/Reabertura de curso, Emissão de documento, Justificativa de falta, Andamento de processo) \n2 - *Assistência Estudantil* \n3 - *Cursos e Formas de Ingresso* \n4 - *Outros* \n5 - *Para encerrar o chat*"
  );
}

function exibirMenu(client, message) {
  sendWppMessage(
    client,
    message.from,
    "*[Menu Principal]* \n1 - *Protocolo* (Número de matrícula, Trancamento/Reabertura de curso, Emissão de documento, Justificativa de falta, Andamento de processo) \n2 - *Assistência Estudantil* \n3 - *Cursos e Formas de Ingresso* \n4 - *Outros* \n5 - *Para encerrar o chat*"
  );
}

function exibirSubMenu(client, message, pre_texto, pos_texto) {
  sendWppMessage(
    client,
    message.from,
    pre_texto +
      "\n0 - Para voltar ao menu principal \n1 - Para encerrar o chat \n2 - Para voltar ao menu anterior" +
      pos_texto
  );
}

function exibirMenuProtocolo(client, message) {
  sendWppMessage(
    client,
    message.from,
    "*[Protocolo]* \na - *Matrícula* para informarmos seu número de matricula \nb - *Trancamento/Reabertura* para solicitar Trancamento ou Reabertura de curso \nc - *Emissão* para Emitir Documento \nd - *Justificativa* para Justificativa de falta \ne - *Andamento* para Andamento de Processos \nf - Para encerrar o chat \n0 - Para voltar ao menu principal"
  );
}

function exibirMenuAssistencia(client, message) {
  sendWppMessage(
    client,
    message.from,
    "*[Assistência Estudantil]* \n0 - Para voltar ao menu principal \n1 - Para encerrar o chat"
  );
}

function exibirMenuCursos(client, message) {
  sendWppMessage(
    client,
    message.from,
    "*[Cursos e formas de ingresso]* \nNossos cursos atualmente disponíveis no campus podem ser encontrados através do link: \nhttps://ifce.edu.br/tabuleirodonorte/campus_tabuleiro/cursos \nPara mais informações sobre as formas de Ingresso aos cursos, clique no link abaixo: \nhttps://ifce.edu.br/acesso-rapido/seja-nosso-aluno/ \n\n0 - Para voltar ao menu principal \n1 - Para encerrar o chat"
  );
}

function exibirMenuOutros(client, message) {
  sendWppMessage(
    client,
    message.from,
    "*[Outros]* \nMe informe com qual setor deseja falar: \na - Comunicação \nb - Diretoria \nc - Coordenação \nd - Secretaria \n \n0 - Para voltar ao menu principal \n1 - Para encerrar o chat"
  );
}

function encerrarChat(client, message) {
  inicializador[message.from] = undefined;
  userStages[message.from] = undefined;
  controller[message.from] = undefined;
  controllerMenu[message.from] = undefined;
  controllerSubMenu[message.from] = undefined;
  section[message.from] = undefined;
  subSection[message.from] = undefined;
  sendWppMessage(client, message.from, "Chat Encerrado!");
}

async function searchCPF(cpfBuscado) {
  try {
    var frase = "";

    if (isNaN(cpfBuscado)) {
      frase = "O CPF deve conter apenas números";
      return frase;
    }

    if (cpfBuscado.length != 11) {
      frase = "O número de CPF deve conter 11 dígitos!";
      return frase;
    }

    const cpf = cpfBuscado.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
    const data = await getSheetData(
      config.credentialsPath,
      config.spreadsheetId,
      config.range
    );

    for (const row of data) {
      if (row[1] === cpf) {
        frase = "A matrícula do aluno é: " + row[4];
        return frase;
      }
    }

    if (resultadoBuscaCPF == null) {
      frase = "CPF não encontrado!";
      return frase;
    }
  } catch (error) {
    console.error("Erro ao buscar o CPF:", error);
  }
}

function sendContact(client, message, opcao) {
  if (opcao == 1) {
    client.sendContactVcard(message.from, 558899584035, "Comunicação");
  } else if (opcao == 2) {
    client.sendContactVcard(message.from, 558591287727, "Diretoria");
  } else if (opcao == 3) {
    client.sendContactVcard(message.from, 558899584035, "Coordenação");
  } else {
    client.sendContactVcard(message.from, 558899584035, "Secretaria");
  }
  controllerMenu[message.from] = undefined;
}

function sendWppMessage(client, sendTo, text) {
  client
    .sendText(sendTo, text)
    .then((result) => {
      // console.log('SUCESSO: ', result);
    })
    .catch((erro) => {
      console.error("ERRO: ", erro);
    });
}

async function saveUser(message) {
  let user = {
    pushname:
      message["sender"]["pushname"] != undefined
        ? message["sender"]["pushname"]
        : "",
    whatsapp: message.from.replace(/[^\d]+/g, ""),
  };
  let newUser = firebasedb.save(user);
  return newUser;
}
