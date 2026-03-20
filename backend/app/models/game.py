from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), default=1)
    level_id = Column(String)
    score = Column(Integer, default=0)
    stars = Column(Integer, default=0)
    perfect_jumps = Column(Integer, default=0)
    coins_earned = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    duration_seconds = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Player", back_populates="sessions")


class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), default=1)
    player_name = Column(String, default="阿饱")
    level_id = Column(String, nullable=True)
    score = Column(Integer, default=0)
    leaderboard_type = Column(String, default="total")  # total, level, weekly
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(String, unique=True)
    name = Column(String)
    description = Column(String)
    icon = Column(String, default="🏆")
    condition_type = Column(String)  # complete_chapter, score, perfect, collect
    condition_value = Column(Integer, default=1)
    reward_coins = Column(Integer, default=100)
