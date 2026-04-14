const Groq = require('groq-sdk');
const fs = require('fs');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkModels() {
    try {
        const models = await groq.models.list();
        fs.writeFileSync('models.json', JSON.stringify(models.data, null, 2));
        console.log('Models saved to models.json');
    } catch (err) {
        console.error('Error fetching models:', err.message);
    }
}

checkModels();
