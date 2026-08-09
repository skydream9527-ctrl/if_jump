from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player, PlayerItem, PlayerBadge
from app.schemas.player import PlayerSchema, PlayerUpdate

router = APIRouter(prefix="/api/player", tags=["player"])


def get_or_create_player(db: Session, player_id: int) -> Player:
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        player = Player(id=player_id, name="阿饱", coins=500)
        db.add(player)
        db.commit()
        db.refresh(player)
    return player


@router.get("/profile", response_model=PlayerSchema)
def get_profile(db: Session = Depends(get_db), x_player_id: int = Header(..., alias="X-Player-Id")):
    return get_or_create_player(db, x_player_id)


@router.put("/profile", response_model=PlayerSchema)
def update_profile(update: PlayerUpdate, db: Session = Depends(get_db), x_player_id: int = Header(..., alias="X-Player-Id")):
    player = get_or_create_player(db, x_player_id)
    if update.name is not None:
        player.name = update.name
    if update.coins is not None:
        player.coins = update.coins
    db.commit()
    db.refresh(player)
    return player
