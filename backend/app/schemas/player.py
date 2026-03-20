from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PlayerBase(BaseModel):
    name: str = "阿饱"


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    coins: Optional[int] = None


class PlayerItemSchema(BaseModel):
    item_type: str
    quantity: int

    class Config:
        from_attributes = True


class PlayerBadgeSchema(BaseModel):
    badge_id: str
    name: str
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlayerSchema(BaseModel):
    id: int
    name: str
    total_score: int
    coins: int
    level: int
    current_chapter: int
    badges: List[PlayerBadgeSchema] = []
    items: List[PlayerItemSchema] = []

    class Config:
        from_attributes = True
