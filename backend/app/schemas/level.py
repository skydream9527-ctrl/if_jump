from pydantic import BaseModel
from typing import Optional, List, Any


class LevelSummary(BaseModel):
    id: str
    name: str
    description: str
    difficulty: int
    is_boss: bool
    target_score: int
    platform_count: int
    order_in_chapter: int

    class Config:
        from_attributes = True


class LevelDetail(LevelSummary):
    platforms_config: List[Any] = []
    mechanics_config: List[Any] = []
    rewards_config: Any = {}

    class Config:
        from_attributes = True


class ChapterSummary(BaseModel):
    id: int
    name: str
    subtitle: str
    description: str
    theme_color: str
    unlock_score: int
    total_levels: int
    icon: str

    class Config:
        from_attributes = True


class ChapterDetail(ChapterSummary):
    levels: List[LevelSummary] = []

    class Config:
        from_attributes = True
