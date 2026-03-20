from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class GameStartRequest(BaseModel):
    level_id: str
    player_id: int = 1


class GameEndRequest(BaseModel):
    session_id: int
    score: int
    perfect_jumps: int
    coins_earned: int
    completed: bool
    duration_seconds: float


class GameSessionSchema(BaseModel):
    id: int
    level_id: str
    score: int
    stars: int
    perfect_jumps: int
    coins_earned: int
    completed: bool
    duration_seconds: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameEndResponse(BaseModel):
    session: GameSessionSchema
    stars: int
    rewards: Any
    new_badges: List[str] = []
    level_unlocked: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    score: int
    level_id: Optional[str] = None

    class Config:
        from_attributes = True


class AchievementSchema(BaseModel):
    id: int
    achievement_id: str
    name: str
    description: str
    icon: str
    reward_coins: int

    class Config:
        from_attributes = True
