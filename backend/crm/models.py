# backend/crm/models.py
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):  # Fixed: Added handler parameter
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return str(v)
            else:
                raise ValueError("Invalid ObjectId")
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_json_schema__(cls, _source_type, _handler):
        return {"type": "string"}

class UserPreferences(BaseModel):
    communication_channel: Optional[str] = None
    product_interests: Optional[List[str]] = None
    budget_range: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_interaction: Optional[datetime] = None
    total_conversations: int = 0

class Conversation(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: Optional[PyObjectId] = None
    messages: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    extracted_data: Optional[Dict[str, Any]] = None

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_interaction: Optional[datetime] = None
    total_conversations: int = 0

class ConversationCreate(BaseModel):
    user_id: Optional[str] = None
    messages: List[Dict[str, Any]] = []
    extracted_data: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    messages: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    extracted_data: Optional[Dict[str, Any]] = None