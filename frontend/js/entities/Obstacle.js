/**
 * 障碍物类
 */
class Obstacle {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.active = config.active !== undefined ? config.active : true;
    this.speed = config.speed || 0;
    this.direction = config.direction || 1;
    this.minX = config.minX || 0;
    this.maxX = config.maxX || Infinity;
    this.width = config.width || 50;
    this.height = config.height || 50;
    this.radius = config.radius || 30;
    this.duration = config.duration || 3000;
    this.startTime = config.startTime || Date.now();
  }

  update(deltaTime) {
    if (this.type === 'youtiao') {
      this.x += this.speed * this.direction;
      if (this.x <= this.minX || this.x >= this.maxX) {
        this.direction *= -1;
      }
    } else if (this.type === 'steam') {
      const elapsed = Date.now() - this.startTime;
      const phase = (elapsed % this.duration) / this.duration;
      this.active = phase < 0.5;
    }
  }

  render(ctx) {
    if (!this.active) return;

    if (this.type === 'youtiao') {
      ctx.fillStyle = '#FFD700';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 3);
        ctx.fill();
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
      
      ctx.fillStyle = '#8B4513';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(this.x + 5, this.y + 3, this.width - 10, this.height - 6, 2);
        ctx.fill();
      } else {
        ctx.fillRect(this.x + 5, this.y + 3, this.width - 10, this.height - 6);
      }
    } else if (this.type === 'steam') {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      gradient.addColorStop(0, 'rgba(200, 200, 200, 0.6)');
      gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  checkCollision(character) {
    if (this.type === 'youtiao') {
      return character.x > this.x && 
             character.x < this.x + this.width && 
             character.y > this.y && 
             character.y < this.y + this.height;
    } else if (this.type === 'steam') {
      const dx = character.x - this.x;
      const dy = character.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.radius;
    }
    return false;
  }
}