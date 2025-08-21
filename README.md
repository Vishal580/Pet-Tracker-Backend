# Pet Activity Tracker - Backend API

A RESTful API built with **Node.js + Express.js** for tracking pet activities, health monitoring, and AI-powered care assistance.

## 🐾 Features

- **Activity Logging**: Track walks, meals, and medications
- **Smart Reminders**: Automatic 6 PM walk notifications
- **AI Chat Assistant**: Context-aware pet care advice
- **Real-time Summary**: Daily activity analytics
- **In-memory Storage**: No database required

## 📁 Folder Structure

```
backend/
├── server.js              # Main Express server
├── package.json           # Dependencies & scripts
├── package-lock.json      # Locked dependency versions
├── .gitignore            # Git ignore rules
├── README.md             # This file
```

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Production
```bash
npm start
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check & stats |
| GET | `/api/activities` | Get all activities |
| POST | `/api/activities` | Log new activity |
| DELETE | `/api/activities/:id` | Delete activity |
| GET | `/api/summary` | Today's summary |
| GET | `/api/reminder` | Check walk reminder |
| POST | `/api/chat` | Send chat message |
| GET | `/api/chat` | Get chat history |

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

## 🌐 Deployment (Render)

### Environment Variables
```env
NODE_ENV=production
PORT=5000
```

### Deploy Steps
1. Connect GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy automatically on git push

### Render Configuration
- **Service Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes

## 🔧 Scripts

- `npm start` - Production server
- `npm run dev` - Development with nodemon
- `npm test` - Run tests (not implemented)

## 📊 Data Storage

Uses in-memory arrays/objects for:
- Pet activities (`petActivities[]`)
- Chat history (`chatHistory[]`) 
- Current pet data (`currentPetData{}`)

## 🤖 AI Features

- Context-aware responses based on logged activities
- Personalized pet care tips
- Health insights and recommendations
- Activity pattern analysis

---

**Tech Stack**: Node.js, Express.js, CORS  
**Deployment**: Render  
**Storage**: In-memory (no database)