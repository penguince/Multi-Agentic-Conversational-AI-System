from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"

class ConversationCategory(str, Enum):
    RESOLVED = "resolved"
    UNRESOLVED = "unresolved"
    INQUIRING = "inquiring"
    GENERAL = "general"

class MessageSender(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

# Database Models
class ConversationSession(BaseModel):
    session_id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None  # Link to CRM user if available
    user_email: Optional[str] = None  # For guest users
    title: Optional[str] = None  # Auto-generated conversation title
    status: ConversationStatus = ConversationStatus.ACTIVE
    category: ConversationCategory = ConversationCategory.INQUIRING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0
    tags: List[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatMessage(BaseModel):
    message_id: Optional[str] = Field(None, alias="_id")
    session_id: str
    sender: MessageSender
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = Field(default_factory=dict)  # For storing context, rag_results, etc.
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# API Request/Response Models
class ConversationSessionCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    title: Optional[str] = None

class ConversationSessionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ConversationStatus] = None
    category: Optional[ConversationCategory] = None
    tags: Optional[List[str]] = None

class MessageCreate(BaseModel):
    content: str
    sender: MessageSender = MessageSender.USER
    metadata: dict = Field(default_factory=dict)

class ConversationSessionResponse(BaseModel):
    session_id: str
    user_id: Optional[str]
    user_email: Optional[str]
    title: Optional[str]
    status: ConversationStatus
    category: ConversationCategory
    created_at: datetime
    updated_at: datetime
    message_count: int
    tags: List[str]
    metadata: dict

class ChatMessageResponse(BaseModel):
    message_id: str
    session_id: str
    sender: MessageSender
    content: str
    timestamp: datetime
    metadata: dict

class ConversationHistoryResponse(BaseModel):
    session: ConversationSessionResponse
    messages: List[ChatMessageResponse]
    total_messages: int
