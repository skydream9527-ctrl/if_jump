/**
 * 平台类
 */
class Platform {
  constructor(x, y, width, height, type = 'normal', food = '🍜') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.food = food;
    this.color = this.getColorByType(type);
    this.isStart = false;
  }

  getColorByType(type) {
    const colors = {
      normal: '#FFB347',
      tofu: '#F5DEB3',
      baozi: '#FFE4C4',
      slippery: '#87CEEB'
    };
    return colors[type] || '#FFB347';
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 8);
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    if (!this.isStart && this.food) {
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.food, this.x + this.width / 2, this.y - 5);
    }
  }
}