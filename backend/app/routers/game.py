from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.game import GameSession, Leaderboard
from app.models.player import Player, PlayerLevelStar
from app.schemas.game import GameStartRequest, GameEndRequest, GameEndResponse, LeaderboardEntry

router = APIRouter(prefix="/api/game", tags=["game"])


def calc_stars(score: int, target_score: int, perfect_jumps: int, completed: bool) -> int:
    if not completed:
        return 0
    if perfect_jumps >= 5 and score >= target_score * 1.5:
        return 3
    if score >= target_score:
        return 2
    return 1


def calc_rewards(stars: int, coins_earned: int):
    bonus_coins = {1: 20, 2: 50, 3: 100}.get(stars, 0)
    return {
        "coins": coins_earned + bonus_coins,
        "bonus_coins": bonus_coins,
        "exp": stars * 100,
    }


@router.post("/start")
def start_game(req: GameStartRequest, db: Session = Depends(get_db)):
    session = GameSession(
        player_id=req.player_id,
        level_id=req.level_id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id}


@router.post("/end", response_model=GameEndResponse)
def end_game(req: GameEndRequest, db: Session = Depends(get_db)):
    session = db.query(GameSession).filter(GameSession.id == req.session_id).first()
    if not session:
        session = GameSession(id=req.session_id, level_id="1-1")
        db.add(session)

    # Determine target score
    from app.models.level import Level
    level = db.query(Level).filter(Level.id == session.level_id).first()
    target_score = level.target_score if level else 500

    stars = calc_stars(req.score, target_score, req.perfect_jumps, req.completed)
    rewards = calc_rewards(stars, req.coins_earned)

    session.score = req.score
    session.stars = stars
    session.perfect_jumps = req.perfect_jumps
    session.coins_earned = rewards["coins"]
    session.completed = req.completed
    session.duration_seconds = req.duration_seconds

    # Update player
    player = db.query(Player).filter(Player.id == session.player_id).first()
    if player:
        player.total_score += req.score
        player.coins += rewards["coins"]

        # Upsert PlayerLevelStar — keep best stars/score
        level_star = db.query(PlayerLevelStar).filter(
            PlayerLevelStar.player_id == player.id,
            PlayerLevelStar.level_id == session.level_id,
        ).first()
        if level_star:
            if stars > level_star.stars:
                level_star.stars = stars
            if req.score > level_star.best_score:
                level_star.best_score = req.score
        else:
            level_star = PlayerLevelStar(
                player_id=player.id,
                level_id=session.level_id,
                stars=stars,
                best_score=req.score,
            )
            db.add(level_star)

        # Advance current_chapter when completing a higher chapter
        if req.completed:
            level_chapter = int(session.level_id.split("-")[0]) if session.level_id else 1
            if level_chapter >= player.current_chapter:
                player.current_chapter = level_chapter

        db.commit()
        db.refresh(player)

        # Add leaderboard entry
        lb = Leaderboard(
            player_id=player.id,
            player_name=player.name,
            level_id=session.level_id,
            score=req.score,
            leaderboard_type="level",
        )
        db.add(lb)

    db.commit()
    db.refresh(session)

    return GameEndResponse(
        session=session,
        stars=stars,
        rewards=rewards,
        new_badges=[],
    )


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(level_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Leaderboard)
    if level_id:
        query = query.filter(Leaderboard.level_id == level_id)
    entries = query.order_by(Leaderboard.score.desc()).limit(20).all()
    return [
        LeaderboardEntry(
            rank=i + 1,
            player_name=e.player_name,
            score=e.score,
            level_id=e.level_id,
        )
        for i, e in enumerate(entries)
    ]


@router.get("/level-stars")
def get_level_stars(db: Session = Depends(get_db)):
    """Return dict of {level_id: {stars, best_score}} for player 1."""
    records = db.query(PlayerLevelStar).filter(PlayerLevelStar.player_id == 1).all()
    return {r.level_id: {"stars": r.stars, "best_score": r.best_score} for r in records}
