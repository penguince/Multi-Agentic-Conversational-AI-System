from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from typing import List, Optional
from datetime import datetime
import uuid

from .models import (
    ConversationSession, ChatMessage, ConversationSessionCreate,
    ConversationSessionUpdate, MessageCreate, ConversationStatus,
    ConversationCategory
)

class ConversationCRUD:
    def __init__(self, database):
        self.db = database
        self.sessions_collection = database["conversations_sessions"]
        self.messages_collection = database["conversations_messages"]
        
    async def create_indexes(self):
        """Create database indexes for better performance"""
        # Session indexes
        await self.sessions_collection.create_index([("user_id", ASCENDING)])
        await self.sessions_collection.create_index([("user_email", ASCENDING)])
        await self.sessions_collection.create_index([("created_at", DESCENDING)])
        await self.sessions_collection.create_index([("status", ASCENDING)])
        
        # Message indexes
        await self.messages_collection.create_index([("session_id", ASCENDING)])
        await self.messages_collection.create_index([("timestamp", ASCENDING)])
        await self.messages_collection.create_index([("sender", ASCENDING)])

    async def create_session(self, session_data: ConversationSessionCreate) -> ConversationSession:
        """Create a new conversation session"""
        session_id = str(uuid.uuid4())
        
        session = ConversationSession(
            session_id=session_id,
            user_id=session_data.user_id,
            user_email=session_data.user_email,
            title=session_data.title or "New Conversation",
            status=ConversationStatus.ACTIVE,
            category=ConversationCategory.INQUIRING,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            message_count=0,
            tags=[],
            metadata={}
        )
        
        # Convert to dict for MongoDB
        session_dict = session.dict(by_alias=True)
        session_dict["_id"] = session_id
        
        await self.sessions_collection.insert_one(session_dict)
        return session

    async def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Get a conversation session by ID"""
        session_doc = await self.sessions_collection.find_one({"_id": session_id})
        if session_doc:
            return ConversationSession(**session_doc)
        return None

    async def update_session(self, session_id: str, update_data: ConversationSessionUpdate) -> Optional[ConversationSession]:
        """Update a conversation session"""
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await self.sessions_collection.update_one(
            {"_id": session_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return await self.get_session(session_id)
        return None

    async def close_session(self, session_id: str) -> bool:
        """Close a conversation session"""
        result = await self.sessions_collection.update_one(
            {"_id": session_id},
            {"$set": {"status": ConversationStatus.CLOSED, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    async def get_user_sessions(self, user_id: str = None, user_email: str = None, limit: int = 20, skip: int = 0) -> List[ConversationSession]:
        """Get conversation sessions for a user"""
        query = {}
        if user_id:
            query["user_id"] = user_id
        elif user_email:
            query["user_email"] = user_email
        else:
            return []
            
        cursor = self.sessions_collection.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
        sessions = []
        async for session_doc in cursor:
            sessions.append(ConversationSession(**session_doc))
        return sessions

    async def search_sessions(self, query: str, limit: int = 20) -> List[ConversationSession]:
        """Search conversation sessions by title or tags"""
        search_query = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"tags": {"$in": [query]}}
            ]
        }
        
        cursor = self.sessions_collection.find(search_query).sort("created_at", DESCENDING).limit(limit)
        sessions = []
        async for session_doc in cursor:
            sessions.append(ConversationSession(**session_doc))
        return sessions

    async def add_message(self, session_id: str, message_data: MessageCreate) -> ChatMessage:
        """Add a message to a conversation"""
        message_id = str(uuid.uuid4())
        
        message = ChatMessage(
            message_id=message_id,
            session_id=session_id,
            sender=message_data.sender,
            content=message_data.content,
            timestamp=datetime.utcnow(),
            metadata=message_data.metadata
        )
        
        # Convert to dict for MongoDB
        message_dict = message.dict(by_alias=True)
        message_dict["_id"] = message_id
        
        # Insert message
        await self.messages_collection.insert_one(message_dict)
        
        # Update session message count and timestamp
        await self.sessions_collection.update_one(
            {"_id": session_id},
            {
                "$inc": {"message_count": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Auto-generate title if this is the first user message
        if message_data.sender.value == "user":
            session = await self.get_session(session_id)
            if session and session.message_count <= 2 and not session.title or session.title == "New Conversation":
                # Generate title from first user message (first 50 chars)
                title = message_data.content[:50].strip()
                if len(message_data.content) > 50:
                    title += "..."
                await self.update_session(session_id, ConversationSessionUpdate(title=title))
        
        return message

    async def get_messages(self, session_id: str, limit: int = 100, skip: int = 0) -> List[ChatMessage]:
        """Get messages for a conversation session"""
        cursor = self.messages_collection.find({"session_id": session_id}).sort("timestamp", ASCENDING).skip(skip).limit(limit)
        messages = []
        async for message_doc in cursor:
            messages.append(ChatMessage(**message_doc))
        return messages

    async def get_conversation_history(self, session_id: str) -> Optional[tuple]:
        """Get full conversation history (session + messages)"""
        session = await self.get_session(session_id)
        if not session:
            return None
            
        messages = await self.get_messages(session_id)
        return session, messages

    async def delete_session(self, session_id: str) -> bool:
        """Delete a conversation session and all its messages"""
        # Delete all messages first
        await self.messages_collection.delete_many({"session_id": session_id})
        
        # Delete session
        result = await self.sessions_collection.delete_one({"_id": session_id})
        return result.deleted_count > 0

    async def get_recent_sessions(self, limit: int = 10) -> List[ConversationSession]:
        """Get recent conversation sessions"""
        cursor = self.sessions_collection.find().sort("updated_at", DESCENDING).limit(limit)
        sessions = []
        async for session_doc in cursor:
            sessions.append(ConversationSession(**session_doc))
        return sessions

    async def tag_session(self, session_id: str, tags: List[str]) -> bool:
        """Add tags to a conversation session"""
        result = await self.sessions_collection.update_one(
            {"_id": session_id},
            {
                "$addToSet": {"tags": {"$each": tags}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0

    async def categorize_session(self, session_id: str, category: ConversationCategory) -> bool:
        """Categorize a conversation session"""
        result = await self.sessions_collection.update_one(
            {"_id": session_id},
            {
                "$set": {
                    "category": category,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
