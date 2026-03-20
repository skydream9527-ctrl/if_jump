from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import chapters, player, game
from app.seed.levels_data import CHAPTERS, ALL_LEVELS
from sqlalchemy.orm import Session

app = FastAPI(title="吃了么 - Game API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chapters.router)
app.include_router(player.router)
app.include_router(game.router)


def seed_database():
    from app.models.level import Chapter, Level
    from app.models.game import Achievement

    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        # Seed chapters
        if db.query(Chapter).count() == 0:
            for c in CHAPTERS:
                chapter = Chapter(
                    id=c["id"], name=c["name"], subtitle=c["subtitle"],
                    description=c["description"], theme_color=c["theme_color"],
                    unlock_score=c["unlock_score"], icon=c["icon"],
                )
                db.add(chapter)

        # Seed levels
        if db.query(Level).count() == 0:
            for lv in ALL_LEVELS:
                chapter_id = int(lv["id"].split("-")[0])
                level = Level(
                    id=lv["id"],
                    chapter_id=chapter_id,
                    name=lv["name"],
                    description=lv["description"],
                    difficulty=lv["difficulty"],
                    is_boss=lv["is_boss"],
                    target_score=lv["target_score"],
                    platform_count=lv["platform_count"],
                    platforms_config=[],
                    mechanics_config=[],
                    rewards_config={
                        "star1": {"coins": 20},
                        "star2": {"coins": 50},
                        "star3": {"coins": 100, "item": "shield"},
                    },
                    order_in_chapter=lv["order"],
                )
                db.add(level)

        # Seed achievements
        if db.query(Achievement).count() == 0:
            achievements = [
                {"achievement_id": "first_jump", "name": "初出茅庐", "description": "完成第一跳", "icon": "🐣", "condition_type": "jump", "condition_value": 1, "reward_coins": 50},
                {"achievement_id": "ch1_clear", "name": "早餐达人", "description": "完成第一章", "icon": "🍳", "condition_type": "complete_chapter", "condition_value": 1, "reward_coins": 200},
                {"achievement_id": "ch2_clear", "name": "午餐专家", "description": "完成第二章", "icon": "🍱", "condition_type": "complete_chapter", "condition_value": 2, "reward_coins": 300},
                {"achievement_id": "score_1000", "name": "积累者", "description": "累计1000分", "icon": "⭐", "condition_type": "score", "condition_value": 1000, "reward_coins": 100},
                {"achievement_id": "perfect_5", "name": "完美主义者", "description": "5次完美落点", "icon": "💎", "condition_type": "perfect", "condition_value": 5, "reward_coins": 150},
                {"achievement_id": "combo_10", "name": "连击达人", "description": "10连击", "icon": "🔥", "condition_type": "combo", "condition_value": 10, "reward_coins": 200},
                {"achievement_id": "all_clear", "name": "厨神", "description": "完成全部章节", "icon": "👑", "condition_type": "complete_chapter", "condition_value": 10, "reward_coins": 5000},
            ]
            for ach in achievements:
                db.add(Achievement(**ach))

        db.commit()


@app.on_event("startup")
def on_startup():
    seed_database()


@app.get("/")
def root():
    return {"message": "吃了么 Game API", "docs": "/docs"}


@app.get("/api/levels/{level_id}")
def get_level_by_id(level_id: str):
    from app.models.level import Level
    with Session(engine) as db:
        level = db.query(Level).filter(Level.id == level_id).first()
        if not level:
            from fastapi import HTTPException
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
        }


@app.get("/api/achievements")
def get_achievements():
    from app.models.game import Achievement
    with Session(engine) as db:
        return db.query(Achievement).all()
