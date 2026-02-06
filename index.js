const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

const secretData = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = JSON.parse(secretData);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://unitv-box-367cc-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function capturar() {
  try {
    const { data } = await axios.get('https://vagas.empregoslocais.com.br/');
    const $ = cheerio.load(data);
    const ref = db.ref('empregos');

    $('.elementor-post').each(async (i, el) => {
      const titulo = $(el).find('.elementor-post__title').text().trim();
      const resumo = $(el).find('.elementor-post__excerpt').text().trim();

      if (resumo.toLowerCase().includes('são luís') || resumo.toLowerCase().includes('slz')) {
        await ref.push({
          title: titulo,
          localizacao: "São Luís, MA",
          descricao: resumo,
          created: Date.now(),
          empresa: "Confidencial",
          empresaKey: "robot_slz"
        });
      }
    });
    console.log("✅ Finalizado!");
  } catch (e) { console.error(e); }
}
capturar();
