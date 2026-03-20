from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.level import Chapter, Level
from app.schemas.level import ChapterSummary, ChapterDetail, LevelDetail

router = APIRouter(prefix="/api/chapters", tags=["chapters"])


@router.get("", response_model=List[ChapterSummary])
def get_chapters(db: Session = Depends(get_db)):
    chapters = db.query(Chapter).order_by(Chapter.id).all()
    return chapters


@router.get("/{chapter_id}", response_model=ChapterDetail)
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.get("/{chapter_id}/levels", response_model=List)
def get_chapter_levels(chapter_id: int, db: Session = Depends(get_db)):
    levels = (
        db.query(Level)
        .filter(Level.chapter_id == chapter_id)
        .order_by(Level.order_in_chapter)
        .all()
    )
    return [
        {
            "id": l.id,
            "name": l.name,
            "description": l.description,
            "difficulty": l.difficulty,
            "is_boss": l.is_boss,
            "target_score": l.target_score,
            "platform_count": l.platform_count,
            "order_in_chapter": l.order_in_chapter,
        }
        for l in levels
    ]


@router.get("/levels/{level_id}")
def get_level(level_id: str, db: Session = Depends(get_db)):
    level = db.query(Level).filter(Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    return {
        "id": level.id,
        "name": level.name,
        "description": level.description,
        "difficulty": level.difficulty,
        "is_boss": level.is_boss,
        "target_score": level.target_score,
        "platform_count": level.platform_count,
        "platforms_config": level.platforms_config or [],
        "mechanics_config": level.mechanics_config or [],
        "rewards_config": level.rewards_config or {},
        "order_in_chapter": level.order_in_chapter,
    }
