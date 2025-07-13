from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .models import (
    User, UserCreate, UserUpdate, UserResponse,
    Conversation, ConversationCreate
)
from .crud import get_user_crud, get_conversation_crud, UserCRUD, ConversationCRUD

# Initialize OpenRouter client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
)

# Chat models
class ChatMessage(BaseModel):
    content: str
    role: str = "user"

class ChatResponse(BaseModel):
    message: str
    model: str
    usage: Optional[dict] = None

router = APIRouter(prefix="/api/crm", tags=["CRM"])

# User endpoints
@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Create a new user"""
    try:
        # Check if user with email already exists
        if user_data.email:
            existing_user = await user_crud.get_user_by_email(user_data.email)
            if existing_user:
                raise HTTPException(status_code=400, detail="User with this email already exists")
        
        user = await user_crud.create_user(user_data)
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone,
            company=user.company,
            job_title=user.job_title,
            preferences=user.preferences,
            tags=user.tags,
            notes=user.notes,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_interaction=user.last_interaction,
            total_conversations=user.total_conversations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Get all users with optional search and pagination"""
    try:
        if search:
            users = await user_crud.search_users(search)
        else:
            users = await user_crud.get_users(skip=skip, limit=limit)
        
        return [
            UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                phone=user.phone,
                company=user.company,
                job_title=user.job_title,
                preferences=user.preferences,
                tags=user.tags,
                notes=user.notes,
                created_at=user.created_at,
                updated_at=user.updated_at,
                last_interaction=user.last_interaction,
                total_conversations=user.total_conversations
            ) for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Get user by ID"""
    try:
        user = await user_crud.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone,
            company=user.company,
            job_title=user.job_title,
            preferences=user.preferences,
            tags=user.tags,
            notes=user.notes,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_interaction=user.last_interaction,
            total_conversations=user.total_conversations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Update user"""
    try:
        user = await user_crud.update_user(user_id, user_data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone,
            company=user.company,
            job_title=user.job_title,
            preferences=user.preferences,
            tags=user.tags,
            notes=user.notes,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_interaction=user.last_interaction,
            total_conversations=user.total_conversations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Delete user"""
    try:
        deleted = await user_crud.delete_user(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Conversation endpoints
@router.post("/conversations", response_model=Conversation)
async def create_conversation(
    conversation_data: ConversationCreate,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud),
    user_crud: UserCRUD = Depends(get_user_crud)
):
    """Create a new conversation"""
    try:
        conversation = await conversation_crud.create_conversation(conversation_data)
        
        # Update user's last interaction if user_id is provided
        if conversation_data.user_id:
            await user_crud.update_last_interaction(conversation_data.user_id)
        
        return conversation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get conversation by ID"""
    try:
        conversation = await conversation_crud.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/conversations", response_model=List[Conversation])
async def get_user_conversations(
    user_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get all conversations for a user"""
    try:
        conversations = await conversation_crud.get_conversations_by_user(user_id)
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data extraction endpoint
@router.post("/extract-user-data")
async def extract_user_data_from_conversation(
    conversation_id: str,
    user_crud: UserCRUD = Depends(get_user_crud),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Extract user data from conversation messages (placeholder for AI integration)"""
    try:
        conversation = await conversation_crud.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # This is a placeholder - in a real implementation, you would use AI/NLP
        # to extract user information from conversation messages
        extracted_data = {
            "potential_name": None,
            "potential_email": None,
            "potential_company": None,
            "confidence_score": 0.0,
            "extracted_from": "conversation_analysis"
        }
        
        # Simple regex-based extraction (you can enhance this with AI)
        import re
        all_messages = " ".join([msg.content for msg in conversation.messages if msg.role == "user"])
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, all_messages)
        if emails:
            extracted_data["potential_email"] = emails[0]
            extracted_data["confidence_score"] += 0.3
        
        # Extract potential company names (basic pattern)
        company_indicators = ["work at", "company", "organization", "Corp", "Inc", "LLC"]
        for indicator in company_indicators:
            if indicator.lower() in all_messages.lower():
                extracted_data["confidence_score"] += 0.1
                break
        
        return extracted_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoint with OpenRouter integration
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(message: ChatMessage):
    """Chat with AI using Google Gemma 3 27B via OpenRouter"""
    try:
        model = os.getenv("OPENAI_MODEL", "google/gemma-2-27b-it")
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for OkADA & CO, a business consulting firm specializing in digital transformation and AI integration. Provide professional and helpful responses for CRM and business-related questions."},
                {"role": message.role, "content": message.content}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return ChatResponse(
            message=response.choices[0].message.content,
            model=model,
            usage=response.usage.model_dump() if response.usage else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# Extract user data from conversation using AI
@router.post("/ai-extract-user-data")
async def ai_extract_user_data(conversation_text: str):
    """Extract user information from conversation using AI"""
    try:
        model = os.getenv("OPENAI_MODEL", "google/gemma-2-27b-it")
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Extract user information (name, email, phone, company, job title) from the conversation text. Return the information in JSON format with confidence scores."},
                {"role": "user", "content": f"Extract user data from this conversation: {conversation_text}"}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        return {"extracted_data": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction error: {str(e)}")