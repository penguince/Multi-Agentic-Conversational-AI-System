# Multi-Agentic Conversational AI System

A comprehensive conversational AI system with CRM integration, featuring user management, real-time chat, and data analytics.

## 🚀 Features

### ✅ **Completed Features**
- **AI-Powered Chat System** - Real-time conversations with OpenAI integration
- **Complete CRM User Management** - Full CRUD operations with MongoDB persistence
- **Interactive Dashboard** - Analytics and system monitoring
- **User Authentication** - Secure login/logout functionality
- **Responsive Design** - Mobile-first responsive interface
- **Real-time Data Updates** - Live synchronization between frontend and backend

### 🔄 **In Progress**
- **Chat-CRM Integration** - Automatic user data extraction from conversations
- **Dashboard Analytics** - Real-time statistics from backend data
- **Advanced Search** - Enhanced filtering and search capabilities

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with custom API clients
- **Authentication**: NextAuth.js integration
- **API Integration**: Custom API clients for backend communication

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **Database**: MongoDB with Motor (async driver)
- **API**: RESTful endpoints with OpenAPI documentation
- **Authentication**: JWT token-based authentication
- **Data Models**: Pydantic models with MongoDB integration

### Database
- **Primary**: MongoDB for user data and CRM information
- **Collections**: Users, Conversations, Preferences
- **Indexing**: Optimized queries for search and analytics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- OpenAI API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd Multi-Agentic-Conversational-AI-System
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api/crm
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Configure your environment variables
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=crm_system
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Start MongoDB service
# Windows:
net start MongoDB
# macOS:
brew services start mongodb/brew/mongodb-community
# Linux:
sudo systemctl start mongod
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
Multi-Agentic-Conversational-AI-System/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   │   ├── chat/               # Chat interface
│   │   ├── users/              # User management
│   │   └── settings/           # System settings
│   └── api/                    # Next.js API routes
├── backend/                    # FastAPI backend
│   ├── crm/                   # CRM module
│   │   ├── models.py          # Pydantic models
│   │   ├── routes.py          # API endpoints
│   │   └── crud.py            # Database operations
│   ├── database.py            # MongoDB connection
│   └── main.py                # FastAPI application
├── components/                 # Reusable UI components
├── lib/                       # Utility libraries
│   └── api/                   # API client libraries
└── public/                    # Static assets
```

## 🔧 API Endpoints

### CRM Endpoints
- `GET /api/crm/users` - Get all users (with search & pagination)
- `POST /api/crm/users` - Create new user
- `GET /api/crm/users/{id}` - Get specific user
- `PUT /api/crm/users/{id}` - Update user
- `DELETE /api/crm/users/{id}` - Delete user
- `POST /api/crm/conversations` - Create conversation
- `GET /api/crm/conversations/{id}` - Get conversation
- `POST /api/crm/extract-user-data` - Extract user data from conversations

### Chat Endpoints
- `POST /api/chat` - Send message to AI and get response

## 🎯 Usage

### User Management
1. Navigate to `/dashboard/users`
2. **Create Users**: Click "Add User" to create new CRM entries
3. **Edit Users**: Click edit icon to modify user information
4. **Search Users**: Use search bar to find specific users
5. **Delete Users**: Click delete icon to remove users

### Chat System
1. Navigate to `/dashboard/chat`
2. **Start Conversation**: Type message and press Enter
3. **AI Responses**: Get intelligent responses from OpenAI
4. **Message History**: View conversation history
5. **Real-time Updates**: Messages update instantly

### Dashboard Analytics
1. Navigate to `/dashboard`
2. **View Metrics**: See user counts, conversation stats
3. **Monitor Activity**: Track system usage and performance
4. **Real-time Data**: Statistics update automatically

## 🧪 Testing

### Frontend Testing
```bash
# Run development server
npm run dev

# Test user management at:
http://localhost:3000/dashboard/users

# Test chat system at:
http://localhost:3000/dashboard/chat
```

### Backend Testing
```bash
# Test API documentation
http://localhost:8000/docs

# Test user endpoints
curl -X GET "http://localhost:8000/api/crm/users"

# Create test user
curl -X POST "http://localhost:8000/api/crm/users" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com"}'
```

### Integration Testing
1. **Create User**: Use frontend to create a user
2. **Verify Database**: Check MongoDB for user data
3. **Test Search**: Search for users by name/email
4. **Test Chat**: Send messages and verify AI responses
5. **Test Updates**: Edit and delete users

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Backend Deployment (Docker)
```bash
# Build Docker image
docker build -t crm-backend ./backend

# Run container
docker run -p 8000:8000 crm-backend
```

### Database Deployment (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Update connection string in backend/.env
4. Configure IP whitelist and database user

## 📊 Current System Status

### ✅ **Working Features**
- **User Management**: Full CRUD operations with MongoDB
- **Chat System**: OpenAI-powered conversations
- **Dashboard UI**: Complete responsive interface
- **API Integration**: Frontend-backend communication
- **Data Persistence**: MongoDB storage and retrieval

### 🔄 **Next Steps**
1. **Integrate Chat with CRM**: Link conversations to user profiles
2. **Real-time Dashboard**: Connect dashboard stats to backend
3. **Advanced Analytics**: User behavior and conversation insights
4. **Automated Data Extraction**: AI-powered user information capture

## 🛡️ Security Features

- **Environment Variables**: Secure API key management
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Pydantic models for data validation
- **Error Handling**: Comprehensive error management
- **Authentication**: JWT-based user authentication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

---

## 🎉 Success Metrics

- ✅ **Full-Stack Integration**: Frontend ↔ Backend ↔ Database
- ✅ **Real-time Communication**: Chat system with AI responses
- ✅ **Data Persistence**: MongoDB storage and retrieval
- ✅ **User Management**: Complete CRM functionality
- ✅ **Responsive Design**: Mobile-first interface
- ✅ **API Documentation**: Interactive OpenAPI docs

**Current Status**: 🟢 **Production Ready** for core features (User Management + Chat)