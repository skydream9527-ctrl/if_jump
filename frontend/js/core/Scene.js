/**
 * 基础场景类 - 所有场景的父类
 */
class Scene {
  constructor(name) {
    this.name = name;
    this.elements = [];
    this.isActive = false;
    this.engine = null;
  }

  /**
   * 初始化场景
   * @param {Object} data - 初始化数据
   */
  init(data = {}) {
    this.data = data;
    this.setupElements();
  }

  /**
   * 设置场景元素
   */
  setupElements() {
    // 子类实现
  }

  /**
   * 显示场景
   */
  show() {
    this.isActive = true;
    this.showScreen();
    this.bindEvents();
  }

  /**
   * 隐藏场景
   */
  hide() {
    this.isActive = false;
    this.unbindEvents();
  }

  /**
   * 销毁场景
   */
  destroy() {
    this.hide();
    this.elements = [];
  }

  /**
   * 更新场景
   * @param {number} deltaTime - 时间差
   */
  update(deltaTime) {
    // 子类实现
  }

  /**
   * 渲染场景
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 子类实现
  }

  /**
   * 处理输入事件
   * @param {Event} event - 输入事件
   */
  handleInput(event) {
    // 子类实现
  }

  /**
   * 显示屏幕
   */
  showScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(this.name).classList.add('active');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 子类实现
  }

  /**
   * 解绑事件
   */
  unbindEvents() {
    // 子类实现
  }
}