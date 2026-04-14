# 🎵 VibeSync AI: Discover Your Music Soul

VibeSync is an AI-powered music discovery platform that translates your visual moods into personalized soundscapes. By combining advanced image analysis with real-time global music charts, VibeSync ensures your playlist always matches your current "vibe."

![VibeSync Hero](https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **🖼️ AI Mood Detection:** Upload any image and let **Gemini 2.5 Flash-Lite** analyze the emotional atmosphere, colors, and textures to determine your mood.
- **🌍 Global Trending Charts:** Stay updated with real-time hits. We interleave the **Top 100 charts from the US and India** (via iTunes RSS) to give you a truly global perspective.
- **📂 Personal Collections:** Save your favorite discoveries into custom-named collections. Manage your music your way with full CRUD support.
- **🕰️ Vibe History:** Never lose a discovery. Your history persists the original photos you uploaded along with the exact recommendations you received.
- **🎧 Seamless Playback:** Preview tracks directly or jump to YouTube for the full experience.
- **🌈 Dynamic Aesthetics:** A premium, dark-themed UI featuring glassmorphism, ambient animations, and responsive layout.

## 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **AI Engine:** Google Gemini 2.5 Flash-Lite
- **Music Data:** iTunes RSS Feeds & Search API

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/24-droid/VibeSync.git
cd VibeSync
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ..
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 📁 Project Structure

```text
├── server/
│   ├── routes/          # API Endpoints (Mood, Trending, Collections)
│   ├── models/          # Mongoose Schemas (User, Analysis, Collection)
│   ├── public/uploads/  # Persistent storage for mood images
│   └── index.js         # Main Entry Point
├── src/
│   ├── components/      # UI Components (SongCard, MoodIndicator, etc.)
│   ├── pages/           # View Components (Home, History, Trending)
│   └── api/             # Axios configuration
└── ...                 # Config files
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ for music lovers who find inspiration in every frame.*
