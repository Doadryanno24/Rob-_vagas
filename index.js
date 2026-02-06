const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

// Pega a chave dos Segredos do GitHub
const secretData = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!secretData) {
  console.error("ERRO: O segredo FIREBASE_SERVICE_ACCOUNT não foi encontrado.");
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(secretData);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://unitv-box-367cc-default-rtdb.firebaseio.com"
  });
} catch (e) {
  console.error("ERRO ao processar o JSON:", e.message);
  process.exit(1);
}

const db = admin.database();

async function capturarVagas() {
  try {
    console.log("Iniciando captura de vagas...");
    const { data } = await axios.get('https://vagas.empregoslocais.com.br/', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const ref = db.ref('empregos');
    let contador = 0;

    const promessas = [];
    $('.elementor-post').each((i, el) => {
      const titulo = $(el).find('.elementor-post__title').text().trim();
      const resumo = $(el).find('.elementor-post__excerpt').text().trim();

      // Filtra apenas vagas de São Luís
      if (resumo.toLowerCase().includes('são luís') || resumo.toLowerCase().includes('slz')) {
        contador++;
        promessas.push(ref.push({
          title: titulo,
          localizacao: "São Luís, MA",
          descricao: resumo,
          created: Date.now(),
          avaliação: "5",
          contato: "Ver no site",
          empresa: "Confidencial",
          empresaKey: "robot_slz",
          favorito: false,
          logoUrl: "https://via.placeholder.com/150",
          whatsapp: "n/a",
          email: "n/a"
        }));
      }
    });
    
    await Promise.all(promessas);
    console.log(`✅ Sucesso! ${contador} vagas de São Luís enviadas para o Firebase.`);
    process.exit(0);
  } catch (e) { 
    console.error("Erro na captura:", e.message);
    process.exit(1);
  }
}

capturarVagas();
