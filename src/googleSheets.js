const { google } = require('googleapis');
const fs = require('fs');

// Função para obter dados de uma planilha
async function getSheetData(credentialsPath, spreadsheetId, range) {
  // Carregar as credenciais do arquivo JSON
  const credentials = JSON.parse(fs.readFileSync(credentialsPath));

  // Configurar o cliente de autenticação
  const { client_email, private_key } = credentials;
  const auth = new google.auth.JWT(
    client_email, 
    null, 
    private_key, 
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  // Inicializar o cliente da API do Google Sheets
  const sheets = google.sheets({ version: 'v4', auth });

  // Obter os dados da planilha
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  
  return response.data.values;
}

// Exportar a função para ser usada em outros módulos
module.exports = {
  getSheetData,
};
