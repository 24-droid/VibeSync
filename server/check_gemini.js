const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function check() {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const res = await model.generateContent('hi');
            console.log(`✅ ${m} Success: ${res.response.text()}`);
        } catch (err) {
            console.log(`❌ ${m} Error: ${err.message}`);
        }
    }
}
check();
