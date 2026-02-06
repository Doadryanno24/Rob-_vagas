const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

// Pega o segredo e limpa qualquer espaço extra que possa ter vindo do celular
const secretData = process.env.FIREBASE_SERVICE_ACCOUNT.trim();

try {
  const serviceAccount = JSON.parse(secretData);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://unity-box-267cc-default-rtdb.europe-west1.firebasedatabase.app"
  });
} catch (e) {
  console.error("Erro ao ler o Segredo JSON. Verifique se colou o texto completo.");
  process.exit(1);
}

const db = admin.database();

async function capturarVagas() {
  try {
    const { data } = await axios.get('https://vagas.empregoslocais.com.br/');
    const $ = cheerio.load(data);
    const ref = db.ref('empregos');

    const promessas = [];
    $('.elementor-post').each((i, el) => {
      const titulo = $(el).find('.elementor-post__title').text().trim();
      const resumo = $(el).find('.elementor-post__excerpt').text().trim();

      if (resumo.toLowerCase().includes('são luís') || resumo.toLowerCase().includes('slz')) {
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
          logoUrl: "https://via.placeholder.com/150"
        }));
      }
    });
    
    await Promise.all(promessas);
    console.log("✅ Vagas enviadas com sucesso!");
  } catch (e) { 
    console.error("Erro na captura:", e); 
  }
}
capturarVagas();


