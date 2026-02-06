const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuração segura para evitar erros de ambiente
const secretData = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!secretData) {
    console.error("Segredo não encontrado.");
    process.exit(1);
}

const serviceAccount = JSON.parse(secretData);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://unitv-box-367cc-default-rtdb.firebaseio.com"
    });
}

const db = admin.database();

async function rodarRobo() {
    try {
        console.log("Iniciando busca...");
        const response = await axios.get('https://vagas.empregoslocais.com.br/', {
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(response.data);
        const ref = db.ref('empregos');
        let encontradas = 0;

        // Mapeia as vagas
        const promessas = [];
        $('.elementor-post').each((i, el) => {
            const titulo = $(el).find('.elementor-post__title').text().trim();
            const resumo = $(el).find('.elementor-post__excerpt').text().trim();

            if (resumo.toLowerCase().includes('são luís') || resumo.toLowerCase().includes('slz')) {
                encontradas++;
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
        console.log(`✅ Sucesso! Foram enviadas ${encontradas} vagas.`);
        process.exit(0);
    } catch (error) {
        console.error("Erro fatal:", error.message);
        process.exit(1);
    }
}

rodarRobo();
