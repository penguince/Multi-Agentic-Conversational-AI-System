from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime

from .models import (
    ConversationSessionCreate, ConversationSessionUpdate, MessageCreate,
    ConversationSessionResponse, ChatMessageResponse, ConversationHistoryResponse,
    ConversationCategory, ConversationStatus
)
from .crud import ConversationCRUD
from database import get_database

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

async def get_conversation_crud():
    """Dependency to get conversation CRUD instance"""
    db = get_database()  # Remove await - get_database() returns db directly
    crud = ConversationCRUD(db)
    await crud.create_indexes()  # Ensure indexes exist
    return crud

# Session Management Endpoints
@router.post("/sessions", response_model=ConversationSessionResponse)
async def create_conversation_session(
    session_data: ConversationSessionCreate,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Create a new conversation session"""
    try:
        session = await conversation_crud.create_session(session_data)
        return ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/sessions/{session_id}", response_model=ConversationSessionResponse)
async def get_conversation_session(
    session_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get a conversation session by ID"""
    session = await conversation_crud.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ConversationSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        user_email=session.user_email,
        title=session.title,
        status=session.status,
        category=session.category,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=session.message_count,
        tags=session.tags,
        metadata=session.metadata
    )

@router.put("/sessions/{session_id}", response_model=ConversationSessionResponse)
async def update_conversation_session(
    session_id: str,
    update_data: ConversationSessionUpdate,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Update a conversation session"""
    session = await conversation_crud.update_session(session_id, update_data)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or no changes made")
    
    return ConversationSessionResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        user_email=session.user_email,
        title=session.title,
        status=session.status,
        category=session.category,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=session.message_count,
        tags=session.tags,
        metadata=session.metadata
    )

@router.post("/sessions/{session_id}/close")
async def close_conversation_session(
    session_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Close a conversation session"""
    success = await conversation_crud.close_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session closed successfully", "session_id": session_id}

@router.delete("/sessions/{session_id}")
async def delete_conversation_session(
    session_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Delete a conversation session and all its messages"""
    success = await conversation_crud.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully", "session_id": session_id}

# Message Management Endpoints
@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def add_message_to_session(
    session_id: str,
    message_data: MessageCreate,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Add a message to a conversation session"""
    # Verify session exists
    session = await conversation_crud.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        message = await conversation_crud.add_message(session_id, message_data)
        return ChatMessageResponse(
            message_id=message.message_id,
            session_id=message.session_id,
            sender=message.sender,
            content=message.content,
            timestamp=message.timestamp,
            metadata=message.metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add message: {str(e)}")

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: str,
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get messages for a conversation session"""
    messages = await conversation_crud.get_messages(session_id, limit, skip)
    return [
        ChatMessageResponse(
            message_id=msg.message_id,
            session_id=msg.session_id,
            sender=msg.sender,
            content=msg.content,
            timestamp=msg.timestamp,
            metadata=msg.metadata
        )
        for msg in messages
    ]

@router.get("/sessions/{session_id}/history", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    session_id: str,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get full conversation history (session + messages)"""
    result = await conversation_crud.get_conversation_history(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session, messages = result
    
    return ConversationHistoryResponse(
        session=ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        ),
        messages=[
            ChatMessageResponse(
                message_id=msg.message_id,
                session_id=msg.session_id,
                sender=msg.sender,
                content=msg.content,
                timestamp=msg.timestamp,
                metadata=msg.metadata
            )
            for msg in messages
        ],
        total_messages=len(messages)
    )

# User Session Management
@router.get("/users/{user_id}/sessions", response_model=List[ConversationSessionResponse])
async def get_user_sessions(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get conversation sessions for a user"""
    sessions = await conversation_crud.get_user_sessions(user_id=user_id, limit=limit, skip=skip)
    return [
        ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        )
        for session in sessions
    ]

@router.get("/users/email/{user_email}/sessions", response_model=List[ConversationSessionResponse])
async def get_user_sessions_by_email(
    user_email: str,
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get conversation sessions for a user by email"""
    sessions = await conversation_crud.get_user_sessions(user_email=user_email, limit=limit, skip=skip)
    return [
        ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        )
        for session in sessions
    ]

# Search and Organization
@router.get("/search", response_model=List[ConversationSessionResponse])
async def search_conversations(
    q: str = Query(..., description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Search conversation sessions by title or tags"""
    sessions = await conversation_crud.search_sessions(q, limit)
    return [
        ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        )
        for session in sessions
    ]

@router.post("/sessions/{session_id}/tag")
async def tag_conversation_session(
    session_id: str,
    tags: List[str],
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Add tags to a conversation session"""
    success = await conversation_crud.tag_session(session_id, tags)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Tags added successfully", "session_id": session_id, "tags": tags}

@router.post("/sessions/{session_id}/categorize")
async def categorize_conversation_session(
    session_id: str,
    category: ConversationCategory,
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Categorize a conversation session"""
    success = await conversation_crud.categorize_session(session_id, category)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session categorized successfully", "session_id": session_id, "category": category}

@router.get("/recent", response_model=List[ConversationSessionResponse])
async def get_recent_conversations(
    limit: int = Query(10, ge=1, le=50),
    conversation_crud: ConversationCRUD = Depends(get_conversation_crud)
):
    """Get recent conversation sessions"""
    sessions = await conversation_crud.get_recent_sessions(limit)
    return [
        ConversationSessionResponse(
            session_id=session.session_id,
            user_id=session.user_id,
            user_email=session.user_email,
            title=session.title,
            status=session.status,
            category=session.category,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            tags=session.tags,
            metadata=session.metadata
        )
        for session in sessions
    ]
