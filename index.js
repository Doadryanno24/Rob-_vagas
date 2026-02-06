const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://unity-box-267cc-default-rtdb.europe-west1.firebasedatabase.app"
});
const db = admin.database();

async function capturarVagas() {
  try {
    const { data } = await axios.get('https://vagas.empregoslocais.com.br/');
    const $ = cheerio.load(data);
    const ref = db.ref('empregos');

    $('.elementor-post').each(async (i, el) => {
      const titulo = $(el).find('.elementor-post__title').text().trim();
      const local = $(el).find('.elementor-post__excerpt').text().trim();

      if (local.toLowerCase().includes('são luís') || local.toLowerCase().includes('slz')) {
        await ref.push({
          avaliação: "5",
          contato: "Ver no site",
          created: Date.now(),
          descricao: `Vaga em São Luís: ${titulo}`,
          email: "n/a",
          empresa: "Confidencial",
          empresaKey: "robot_slz",
          favorito: false,
          localizacao: "São Luís, MA",
          logoUrl: "https://via.placeholder.com/150",
          title: titulo,
          whatsapp: "n/a"
        });
      }
    });
    console.log("✅ Vagas processadas!");
  } catch (e) { console.error(e); }
}
capturarVagas();

