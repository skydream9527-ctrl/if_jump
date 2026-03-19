/**
 * 玩家类
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.vy = 0;
    this.vx = 0;
    this.isJumping = false;
    this.rotation = 0;
    this.health = 100;
    this.speed = 1;
  }

  update(deltaTime) {
    // 更新玩家状态
    if (this.isJumping) {
      this.vy += 0.5; // 重力
      this.x += this.vx * deltaTime * 0.05;
      this.y += this.vy * deltaTime * 0.05;
      this.rotation += deltaTime * 0.01;
    }
  }

  jump(power, angle) {
    this.vy = power * Math.sin(angle);
    this.vx = power * Math.cos(angle);
    this.isJumping = true;
  }

  land() {
    this.vy = 0;
    this.vx = 0;
    this.isJumping = false;
    this.rotation = 0;
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  heal(amount) {
    this.health = Math.min(100, this.health + amount);
  }
}