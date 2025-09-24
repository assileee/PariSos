# PariSos - Paris Student Assistant

A comprehensive web application to help international students navigate administrative tasks when settling in Paris.

## Features

- 🤖 **AI Chatbot**: Get personalized assistance for Paris administrative tasks
- ✅ **Smart Checklist Generator**: Create custom checklists based on your situation (EU/non-EU, student level, etc.)
- 📋 **Task Management**: Track progress on visa, CAF, banking, and other essential tasks
- 🎓 **Student Resources**: Quick access to important websites and guides
- 💬 **Free Chat Mode**: Ask any questions about student life in Paris

## Tech Stack

- **Frontend**: React (Vite), Bootstrap 5
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI**: Ollama (local LLM) or ChatGPT API
- **Container**: Docker & Docker Compose
- **Auth**: JWT tokens

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd parisos
```

### 2. Set up Ollama (for AI chatbot)

#### Option A: Install Ollama locally (Recommended)
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (e.g., llama2)
ollama pull llama2

# Start Ollama server (runs on port 11434)
ollama serve
```

#### Option B: Use mock responses (for testing without AI)
The app will work without Ollama but will provide pre-defined responses.

### 3. Configure environment variables

Create `.env` file in the backend folder:
```env
# MongoDB
MONGO_URI=mongodb://mongodb:27017/parisos

# JWT Secret
SECRET_TOKEN_KEY=your_secret_key_here

# Ollama Configuration
USE_OLLAMA=false  # Set to true when Ollama is running
OLLAMA_API_URL=http://host.docker.internal:11434/api/chat
OLLAMA_MODEL=llama2
```

### 4. Start the application
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or rebuild if you made changes
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- MongoDB: localhost:27018

### 5. Create your first account
1. Navigate to http://localhost:5173
2. Click "Sign-up"
3. Create an account with your details
4. Log in

## Using the Application

### Creating a Personalized Checklist
1. After login, click on "Chatbot" in the navbar
2. Choose "Create Personalized Checklist"
3. Answer questions about:
   - Your nationality (EU/non-EU)
   - Student level (Bachelor/Master/PhD)
   - Accommodation status
   - Duration of stay
4. The AI will generate a custom checklist based on your situation
5. Access your checklist anytime from "My Checklist" in the navbar

### Using Free Chat Mode
1. Click on "Chatbot"
2. Choose "Ask Questions"
3. Ask anything about:
   - Visa procedures (OFII, VLS-TS)
   - CAF housing assistance
   - Opening bank accounts
   - Healthcare (CPAM, Ameli)
   - Student discounts
   - Transportation (Navigo, Imagine R)

### Managing Your Checklist
- ✅ Check off completed tasks
- 🔍 Filter by priority (urgent, pending, completed)
- 📊 Track your overall progress
- 📥 Export your checklist as JSON
- 🔗 Access direct links to official websites

## File Structure

```
parisos/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LogInPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ChatbotPage.jsx      # AI chat interface
│   │   │   └── ChecklistPage.jsx    # Checklist manager
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   └── FooterComp.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── controllers/
│   │   ├── userControllers.js
│   │   └── chatbotController.js     # AI logic & checklist generation
│   ├── models/
│   │   ├── userModels.js
│   │   └── checklistModels.js       # Checklist schema
│   ├── routes/
│   │   ├── users.js
│   │   └── chatbot.js               # Chatbot API routes
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Create new account
- `POST /api/users/login` - Login

### Chatbot & Checklist
- `POST /api/chatbot/message` - Send message to AI
- `GET /api/chatbot/checklist` - Get user's checklist
- `PATCH /api/chatbot/checklist/toggle/:itemId` - Toggle task completion
- `GET /api/chatbot/checklist/export` - Export checklist

## Troubleshooting

### Ollama not connecting
- Ensure Ollama is running: `ollama list` should show available models
- Check if port 11434 is accessible
- In Docker, use `http://host.docker.internal:11434` for macOS/Windows
- For Linux, you might need to use the host's IP address

### Mock mode (without Ollama)
Set `USE_OLLAMA=false` in your `.env` file. The chatbot will use predefined responses.

### MongoDB connection issues
- Ensure MongoDB container is running: `docker ps`
- Check logs: `docker logs parisos_mongodb_1`

## Development

### Adding new checklist categories
Edit `checklistTemplates` in `backend/controllers/chatbotController.js`

### Customizing AI responses
Modify `systemPrompts` in `backend/controllers/chatbotController.js`

### Running without Docker
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Backend
cd backend
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

## Future Enhancements

- [ ] PDF export for checklists
- [ ] Email reminders for deadlines
- [ ] Multi-language support (French/English)
- [ ] Community forum for students
- [ ] Document upload and storage
- [ ] Integration with official French services APIs
- [ ] Mobile app version

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.