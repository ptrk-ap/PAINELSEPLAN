require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Middleware keep-alive
app.use((req, res, next) => {
  if (req.path === '/keep-alive') {
    return res.status(200).send('Server is alive');
  }
  next();
});

// Configuração
const API_USER = process.env.API_USER;
const API_PASS = process.env.API_PASS;
const API_URL = process.env.API_URL;

let cachedToken = null;
let tokenExpiration = null;

// Função para obter novo token
async function getNewToken() {
  try {
    const response = await axios.post(`${API_URL}/auth`, {
      usuario: API_USER,
      senha: API_PASS
    });

    const token = response.data.token;
    const expiresIn = response.data.expires_in || 600;

    cachedToken = token;
    tokenExpiration = Date.now() + expiresIn * 1000;

    console.log('Novo token obtido:', token);
    return token;

  } catch (error) {
    console.error('Erro ao obter token:', error.message);
    return null;
  }
}

// Agendador para renovar o token a cada 15 minutos
setInterval(async () => {
  console.log('Renovando token...');
  await getNewToken();
}, 15 * 60 * 1000); // 15 minutos

// Ao iniciar, obter o primeiro token
(async () => {
  console.log('Obtendo token inicial...');
  await getNewToken();
})();


// Rota de validação de token

// Rota que utiliza o token armazenado
app.get('/get-data', async (req, res) => {
  try {
    if (!cachedToken || Date.now() >= tokenExpiration) {
      console.log('Token expirado ou inexistente. Renovando...');
      await getNewToken();
    }

    const consultaResponse = await axios.post(
      'https://siplag.ap.gov.br/FlexSiafeAP/api/consultas/011255',
      {},
      {
        headers: {
          'Authorization': `Bearer ${cachedToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(consultaResponse.data);

  } catch (error) {
    console.error('Erro na rota /get-data:', error.message);
    res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});
app.get('/get-receita', async (req, res) => {
  try {
    if (!cachedToken || Date.now() >= tokenExpiration) {
      console.log('Token expirado ou inexistente. Renovando...');
      await getNewToken();
    }

    const consultaResponse = await axios.post(
      'https://siplag.ap.gov.br/FlexSiafeAP/api/consultas/011252',
      {},
      {
        headers: {
          'Authorization': `Bearer ${cachedToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(consultaResponse.data);

  } catch (error) {
    console.error('Erro na rota /get-data:', error.message);
    res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

app.get('/get-UG', async (req, res) => {
  try {
    if (!cachedToken || Date.now() >= tokenExpiration) {
      console.log('Token expirado ou inexistente. Renovando...');
      await getNewToken();
    }

    const consultaResponse = await axios.post(
      'https://siplag.ap.gov.br/FlexSiafeAP/api/consultas/011254',
      {},
      {
        headers: {
          'Authorization': `Bearer ${cachedToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(consultaResponse.data);

  } catch (error) {
    console.error('Erro na rota /get-data:', error.message);
    res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});





app.get('/data', async (req, res) => {
  try {

   const teste = await getNewToken();
   console.log(teste);



  } catch (error) {
    console.error('Erro na rota /get-data:', error.message);
    res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});


app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
