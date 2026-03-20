from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player, PlayerItem, PlayerBadge
from app.schemas.player import PlayerSchema, PlayerUpdate

router = APIRouter(prefix="/api/player", tags=["player"])


def get_or_create_player(db: Session) -> Player:
    player = db.query(Player).filter(Player.id == 1).first()
    if not player:
        player = Player(id=1, name="阿饱", coins=500)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player


@router.get("/profile", response_model=PlayerSchema)
def get_profile(db: Session = Depends(get_db)):
    return get_or_create_player(db)


@router.put("/profile", response_model=PlayerSchema)
def update_profile(update: PlayerUpdate, db: Session = Depends(get_db)):
    player = get_or_create_player(db)
    if update.name is not None:
        player.name = update.name
    if update.coins is not None:
        player.coins = update.coins
    db.commit()
    db.refresh(player)
    return player
