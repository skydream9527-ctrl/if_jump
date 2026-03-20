from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)          # 起床第一餐
    subtitle = Column(String)      # 早餐篇
    description = Column(String)
    theme_color = Column(String, default="#FFF9E6")
    unlock_score = Column(Integer, default=0)
    total_levels = Column(Integer, default=10)
    icon = Column(String, default="🍳")

    levels = relationship("Level", back_populates="chapter")


class Level(Base):
    __tablename__ = "levels"

    id = Column(String, primary_key=True)   # "1-1", "1-2" ...
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    name = Column(String)
    description = Column(String)
    difficulty = Column(Integer, default=1)  # 1-10
    is_boss = Column(Boolean, default=False)
    target_score = Column(Integer, default=500)
    platform_count = Column(Integer, default=10)
    platforms_config = Column(JSON, default=list)   # list of platform objects
    mechanics_config = Column(JSON, default=list)
    rewards_config = Column(JSON, default=dict)
    order_in_chapter = Column(Integer, default=1)

    chapter = relationship("Chapter", back_populates="levels")
