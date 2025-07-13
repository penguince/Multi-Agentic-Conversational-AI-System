# Multi-Agentic Conversational AI System

A comprehensive conversational AI system with CRM integration, featuring user management, real-time chat, property analytics, and business intelligence.

## 🚀 Features

### ✅ **Core Features**
- **🤖 AI-Powered Chat System** - Real-time conversations with Google Gemma 2 27B via OpenRouter
- **👥 Complete CRM User Management** - Full CRUD operations with MongoDB persistence
- **📊 Interactive Dashboard** - Real-time analytics and system monitoring
- **🏢 Property Management System** - Commercial real estate portfolio management
- **💬 Conversation Management** - Session-based chat history and persistence
- **📱 Responsive Design** - Mobile-first responsive interface with modern UI
- **🔄 Real-time Data Updates** - Live synchronization between frontend and backend
- **🔍 Advanced Search & Analytics** - Property search, market analysis, and business insights

### 📋 **Dashboard Pages**
- **Main Dashboard** - System overview and key metrics
- **Chat Interface** - AI assistant with business context
- **User Management** - CRM user database with CRUD operations
- **Property Analytics** - Commercial real estate portfolio insights
- **Document Management** - File organization and management
- **Settings** - System configuration and preferences

### 🏗 **System Modules**
- **CRM Module** - User data capture and management
- **Analytics Module** - Property search and market analysis
- **Conversation Module** - Chat session management and history
- **Authentication** - Secure login/logout functionality

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with React 18 and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with custom API clients
- **UI Components**: Modern component library with Lucide icons
- **API Integration**: Custom API clients for backend communication
- **Routing**: App Router with dynamic routes and layouts

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.9+
- **Database**: MongoDB with Motor (async driver)
- **API**: RESTful endpoints with OpenAPI documentation
- **Data Models**: Pydantic models with MongoDB integration
- **Modules**: 
  - CRM: User management and data capture
  - Analytics: Property search and market analysis
  - Conversations: Chat session management

### Database Schema
- **Primary**: MongoDB for all application data
- **Collections**: 
  - `users` - CRM user profiles and contact information
  - `conversations` - Chat sessions and message history
  - `properties` - Commercial real estate portfolio data
  - `analytics` - Search queries and usage statistics
- **Indexing**: Optimized queries for search and analytics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- OpenRouter API key (for free Google Gemma 3 27B model)

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
OPENAI_API_KEY=sk-or-v1-your-openrouter-api-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=google/gemma-2-27b-it
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
OPENAI_API_KEY=sk-or-v1-your-openrouter-api-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=google/gemma-2-27b-it
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
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

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/search` - Search properties with query
- `GET /api/analytics/market-summary` - Get market overview data
- `GET /api/analytics/properties` - Get all properties with filters

### Conversation Endpoints
- `POST /api/conversations/sessions` - Create new conversation session
- `GET /api/conversations/sessions/{id}` - Get conversation session
- `POST /api/conversations/sessions/{id}/messages` - Add message to session
- `GET /api/conversations/sessions/{id}/history` - Get conversation history

### Chat Endpoints
- `POST /api/chat/enhanced` - Enhanced AI chat with business context
- `POST /api/chat` - Basic AI chat endpoint

## 🎯 Usage

### 1. Dashboard Overview
- Navigate to `/dashboard` for system overview
- View key metrics and analytics
- Access all system modules from the sidebar

### 2. AI Chat Assistant
1. Navigate to `/dashboard/chat`
2. **Start Conversations**: Type messages to interact with the AI
3. **Business Context**: Ask about properties, market analysis, or business insights
4. **Session Management**: Chat history is automatically saved
5. **Example Queries**:
   - "Show me properties on Broadway"
   - "What's the average rent in our portfolio?"
   - "Find properties managed by Jack Sparrow"

### 3. User Management (CRM)
1. Navigate to `/dashboard/users`
2. **Create Users**: Click "Add User" to create new CRM entries
3. **Edit Users**: Click edit icon to modify user information
4. **Search Users**: Use search bar to find specific users
5. **Delete Users**: Click delete icon to remove users

### 4. Property Analytics
1. Navigate to `/dashboard/properties`
2. **View Portfolio**: Browse all commercial properties
3. **Search Properties**: Filter by location, size, or rent
4. **Market Analysis**: View market trends and insights
5. **Property Details**: Click on properties for detailed information

### 5. Document Management
1. Navigate to `/dashboard/documents`
2. **File Organization**: Manage business documents
3. **Search Documents**: Find files by name or type
4. **Upload Files**: Add new documents to the system

### Chat System
1. Navigate to `/dashboard/chat`
2. **Start Conversation**: Type message and press Enter
3. **AI Responses**: Get intelligent responses from Google Gemma 3 27B via OpenRouter
4. **Message History**: View conversation history
5. **Real-time Updates**: Messages update instantly
6. **Business Context**: AI understands OkADA & CO consulting firm context
7. **Property Data Analysis**: Built-in commercial property dataset integration

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

# Test AI chat with sample message
Send: "What services does OkADA & CO offer?"
Expected: Response about consulting and digital transformation services
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
4. **Test Chat**: Send messages and verify AI responses using Google Gemma 3 27B
5. **Test Business Context**: Ask about OkADA & CO services and property data
6. **Test Updates**: Edit and delete users

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
- **Chat System**: Google Gemma 2 27B powered conversations via OpenRouter (FREE)
- **Multi-Agent AI**: Intelligent responses with business context and property data
- **Dashboard UI**: Complete responsive interface with modern design
- **API Integration**: Seamless frontend-backend communication
- **Data Persistence**: MongoDB storage and retrieval
- **Real-time Chat**: Streaming AI responses with session management
- **Business Intelligence**: OkADA & CO consulting firm context
- **Property Analytics**: Commercial real estate portfolio with 225+ properties
- **Search & Analytics**: Advanced property search and market analysis
- **Conversation History**: Persistent chat sessions and message storage

### � **Technology Stack**
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.9+, Pydantic, Motor (async MongoDB)
- **Database**: MongoDB with optimized indexing
- **AI**: Google Gemma 2 27B via OpenRouter API (Free tier available)
- **State Management**: React hooks with custom API clients
- **UI**: Modern responsive design with Lucide React icons
- **Development**: Hot reload, TypeScript checking, ESLint

### 🎯 **Business Features**
- **CRM Integration**: User profile management and data capture
- **Property Portfolio**: 225 Manhattan commercial properties
- **Market Analysis**: Rent analysis, square footage tracking, location insights
- **Associate Management**: Property managers and broker information
- **Business Context**: OkADA & CO consulting firm specialization

### 🔄 **Future Enhancements**
1. **Enhanced CRM Integration**: Auto-extract user data from conversations
2. **Advanced Analytics Dashboard**: Real-time business intelligence
3. **Document Management**: File upload and organization system
4. **User Authentication**: Secure login and role-based access
5. **Mobile App**: React Native mobile application

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
- ✅ **AI-Powered Communication**: Chat system with Google Gemma 3 27B responses (FREE)
- ✅ **Multi-Agent Intelligence**: Business context awareness and property data analysis
- ✅ **Data Persistence**: MongoDB storage and retrieval
- ✅ **User Management**: Complete CRM functionality
- ✅ **Responsive Design**: Mobile-first interface
- ✅ **API Documentation**: Interactive OpenAPI docs
- ✅ **Real-time Features**: Streaming chat responses
- ✅ **Business Intelligence**: OkADA & CO consulting firm integration
- ✅ **Cost-Effective**: Free AI model via OpenRouter

**Current Status**: 🟢 **Production Ready** for core features (User Management + AI Chat + Multi-Agent Intelligence)