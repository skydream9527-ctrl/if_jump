from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="阿饱")
    total_score = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_chapter = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sessions = relationship("GameSession", back_populates="player")
    badges = relationship("PlayerBadge", back_populates="player")
    items = relationship("PlayerItem", back_populates="player")


class PlayerBadge(Base):
    __tablename__ = "player_badges"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    badge_id = Column(String)
    name = Column(String)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Player", back_populates="badges")


class PlayerItem(Base):
    __tablename__ = "player_items"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    item_type = Column(String)  # shield, freeze, double_score, magnet, shrink
    quantity = Column(Integer, default=1)

    player = relationship("Player", back_populates="items")


class PlayerLevelStar(Base):
    __tablename__ = "player_level_stars"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), default=1)
    level_id = Column(String, index=True)
    stars = Column(Integer, default=0)   # 0=not cleared, 1/2/3
    best_score = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
