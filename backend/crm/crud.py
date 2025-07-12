from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from .models import User, UserCreate, UserUpdate, Conversation, ConversationCreate
from database import get_database

class UserCRUD:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        user_dict = user_data.dict(exclude_unset=True)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        user_dict["total_conversations"] = 0
        
        result = await self.collection.insert_one(user_dict)
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        return User(**created_user)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        if not ObjectId.is_valid(user_id):
            return None
        
        user_doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        return User(**user_doc) if user_doc else None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        user_doc = await self.collection.find_one({"email": email})
        return User(**user_doc) if user_doc else None

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        cursor = self.collection.find().skip(skip).limit(limit)
        users = []
        async for user_doc in cursor:
            users.append(User(**user_doc))
        return users

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user"""
        if not ObjectId.is_valid(user_id):
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            updated_user = await self.collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            return User(**updated_user) if updated_user else None
        return None

    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        if not ObjectId.is_valid(user_id):
            return False
        
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    async def search_users(self, query: str) -> List[User]:
        """Search users by name, email, or company"""
        search_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
                {"company": {"$regex": query, "$options": "i"}}
            ]
        }
        
        cursor = self.collection.find(search_filter)
        users = []
        async for user_doc in cursor:
            users.append(User(**user_doc))
        return users

    async def update_last_interaction(self, user_id: str) -> bool:
        """Update user's last interaction timestamp"""
        if not ObjectId.is_valid(user_id):
            return False
        
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {"last_interaction": datetime.utcnow()},
                "$inc": {"total_conversations": 1}
            }
        )
        return result.modified_count > 0

class ConversationCRUD:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.conversations

    async def create_conversation(self, conversation_data: ConversationCreate) -> Conversation:
        """Create a new conversation"""
        conversation_dict = conversation_data.dict()
        conversation_dict["created_at"] = datetime.utcnow()
        conversation_dict["updated_at"] = datetime.utcnow()
        
        # Convert user_id to ObjectId if provided
        if conversation_dict.get("user_id"):
            conversation_dict["user_id"] = ObjectId(conversation_dict["user_id"])
        
        result = await self.collection.insert_one(conversation_dict)
        created_conversation = await self.collection.find_one({"_id": result.inserted_id})
        return Conversation(**created_conversation)

    async def get_conversation_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """Get conversation by ID"""
        if not ObjectId.is_valid(conversation_id):
            return None
        
        conversation_doc = await self.collection.find_one({"_id": ObjectId(conversation_id)})
        return Conversation(**conversation_doc) if conversation_doc else None

    async def get_conversations_by_user(self, user_id: str) -> List[Conversation]:
        """Get all conversations for a user"""
        if not ObjectId.is_valid(user_id):
            return []
        
        cursor = self.collection.find({"user_id": ObjectId(user_id)})
        conversations = []
        async for conversation_doc in cursor:
            conversations.append(Conversation(**conversation_doc))
        return conversations

    async def add_message_to_conversation(self, conversation_id: str, message: Dict[str, Any]) -> bool:
        """Add a message to an existing conversation"""
        if not ObjectId.is_valid(conversation_id):
            return False
        
        result = await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0

# Initialize CRUD instances
def get_user_crud() -> UserCRUD:
    return UserCRUD(get_database())

def get_conversation_crud() -> ConversationCRUD:
    return ConversationCRUD(get_database())