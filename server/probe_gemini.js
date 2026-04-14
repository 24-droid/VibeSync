const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function probe() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    try {
        const res = await axios.get(url);
        fs.writeFileSync('gemini_models.json', JSON.stringify(res.data.models, null, 2));
        console.log('Saved to gemini_models.json');
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

probe();
