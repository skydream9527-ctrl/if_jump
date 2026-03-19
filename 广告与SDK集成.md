# 吃了么 - 广告与SDK集成

## 一、广告系统设计

### 1.1 广告类型与场景

| 广告类型 | 使用场景 | 频次限制 | 奖励 |
|---------|---------|---------|------|
| 激励视频 | 复活、双倍奖励 | 5次/小时 | 复活/金币×2 |
| 插屏广告 | 关卡切换 | 3次/小时 | 无 |
| Banner广告 | 主菜单底部 | 常驻 | 无 |
| 原生广告 | 结算页面 | 1次/关卡 | 无 |

### 1.2 广告位详细设计

#### 激励视频广告

**使用场景：**
1. **关卡复活**
   - 触发：游戏失败后
   - 位置：失败结算页
   - 按钮："观看广告复活"
   - 奖励：从失败点继续游戏

2. **双倍奖励**
   - 触发：关卡通关后
   - 位置：通关结算页
   - 按钮："观看广告双倍金币"
   - 奖励：本次金币×2

3. **免费道具**
   - 触发：每日限制次数
   - 位置：商城/主菜单
   - 按钮："观看广告获得道具"
   - 奖励：随机道具×1

**广告配置：**
```javascript
{
  "rewardedVideo": {
    "adUnitId": "adunit-xxxx",
    "preload": true,
    "preloadCount": 2,
    "timeout": 30,
    "dailyLimit": 20,
    "hourlyLimit": 5,
    "cooldown": 60
  }
}
```

#### 插屏广告

**触发时机：**
- 每3次关卡切换后
- 从游戏返回主菜单时
- 每次游戏启动后（首次除外）

**展示规则：**
```javascript
{
  "interstitial": {
    "adUnitId": "adunit-yyyy",
    "minInterval": 60,
    "maxPerHour": 3,
    "maxPerDay": 10,
    "skipFirst": true,
    "showOn": ["level_complete", "return_menu", "app_launch"]
  }
}
```

#### Banner广告

**位置：** 主菜单底部
**尺寸：** 自适应宽度，标准高度
**展示：** 常驻显示

```javascript
{
  "banner": {
    "adUnitId": "adunit-zzzz",
    "position": "bottom",
    "autoRefresh": true,
    "refreshInterval": 30,
    "hideDuringGame": true
  }
}
```

### 1.3 广告展示流程

#### 激励视频流程

```
用户点击"观看广告"
   ↓
检查广告库存
   ├─ 有库存 → 预加载广告
   └─ 无库存 → 提示"广告加载中"
   ↓
展示广告
   ↓
用户观看完成
   ├─ 完整观看 → 发放奖励
   └─ 中途关闭 → 提示"需完整观看"
   ↓
关闭广告，回到游戏
```

#### 插屏广告流程

```
触发条件满足
   ↓
检查展示间隔
   ├─ 间隔满足 → 继续
   └─ 间隔不足 → 跳过
   ↓
检查频次限制
   ├─ 未超限 → 继续
   └─ 已超限 → 跳过
   ↓
预加载广告
   ↓
展示广告（自动关闭或点击关闭）
   ↓
继续游戏流程
```

---

## 二、微信SDK集成

### 2.1 基础SDK

#### 初始化配置

```javascript
// app.js 或 main.js
App({
  onLaunch() {
    // 初始化云开发（如需要）
    wx.cloud.init({
      env: 'your-env-id',
      traceUser: true
    });
    
    // 登录获取openid
    this.login();
    
    // 初始化广告
    this.initAds();
    
    // 上报启动数据
    this.reportLaunch();
  },
  
  login() {
    wx.login({
      success: (res) => {
        // 获取code，发送给服务器换取openid
        this.getOpenId(res.code);
      }
    });
  },
  
  initAds() {
    // 预加载广告
    this.rewardedAd = this.createRewardedAd();
    this.interstitialAd = this.createInterstitialAd();
    this.bannerAd = this.createBannerAd();
  }
});
```

#### 广告SDK封装

```javascript
// AdManager.js
class AdManager {
  constructor() {
    this.rewardedAd = null;
    this.interstitialAd = null;
    this.bannerAd = null;
    this.preloadQueue = [];
  }
  
  // 创建激励视频广告
  createRewardedAd(adUnitId) {
    const ad = wx.createRewardedVideoAd({ adUnitId });
    
    ad.onLoad(() => {
      console.log('激励视频广告加载成功');
    });
    
    ad.onError((err) => {
      console.error('激励视频广告错误:', err);
      this.reportError('rewarded', err);
    });
    
    ad.onClose((res) => {
      // isEnded: 是否完整观看
      if (res.isEnded) {
        this.onRewardedComplete();
      } else {
        this.onRewardedSkip();
      }
    });
    
    return ad;
  }
  
  // 展示激励视频
  async showRewardedAd() {
    try {
      await this.rewardedAd.load();
      await this.rewardedAd.show();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }
  
  // 创建插屏广告
  createInterstitialAd(adUnitId) {
    const ad = wx.createInterstitialAd({ adUnitId });
    return ad;
  }
  
  // 创建Banner广告
  createBannerAd(adUnitId, style) {
    const ad = wx.createBannerAd({
      adUnitId,
      style: {
        left: 0,
        top: 0,
        width: 375, // 会根据宽度自适应高度
        ...style
      }
    });
    return ad;
  }
  
  // 检查广告限制
  checkAdLimit(type) {
    const today = new Date().toDateString();
    const limit = this.getAdLimit(type);
    const todayCount = this.getTodayAdCount(type);
    
    return {
      canShow: todayCount < limit.maxPerDay,
      remaining: limit.maxPerDay - todayCount,
      nextReset: '次日0点'
    };
  }
}
```

### 2.2 分享功能

#### 分享配置

```javascript
// 分享功能封装
class ShareManager {
  // 普通分享
  shareAppMessage(options) {
    return new Promise((resolve, reject) => {
      wx.shareAppMessage({
        title: options.title || '吃了么 - 美食跳跃大冒险',
        imageUrl: options.imageUrl || 'share_image.jpg',
        query: `inviter=${options.inviterId}&level=${options.level}`,
        success: (res) => {
          this.onShareSuccess(res);
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
  
  // 带分享回调的分享
  shareWithReward(options) {
    // 监听分享成功
    wx.onShow(() => {
      // 判断是否从分享返回
      if (this.isFromShare()) {
        this.giveShareReward();
      }
    });
    
    return this.shareAppMessage(options);
  }
  
  // 分享图片生成
  async generateShareImage(data) {
    const canvas = wx.createCanvas();
    const ctx = canvas.getContext('2d');
    
    // 绘制分享图
    // 1. 背景
    // 2. 分数
    // 3. 关卡信息
    // 4. 二维码
    
    return canvas.toTempFilePath({
      width: 500,
      height: 400,
      destWidth: 500,
      destHeight: 400
    });
  }
}
```

### 2.3 数据上报

#### 自定义打点

```javascript
// Analytics.js
class Analytics {
  // 事件上报
  trackEvent(eventName, params = {}) {
    // 微信内置打点
    wx.reportAnalytics(eventName, {
      ...params,
      timestamp: Date.now(),
      userId: getUserId()
    });
    
    // 第三方统计（如阿拉丁、神策）
    this.trackThirdParty(eventName, params);
  }
  
  // 关卡开始
  trackLevelStart(levelId) {
    this.trackEvent('level_start', {
      level_id: levelId,
      chapter: getChapterFromLevel(levelId)
    });
  }
  
  // 关卡完成
  trackLevelComplete(levelId, score, stars, duration) {
    this.trackEvent('level_complete', {
      level_id: levelId,
      score,
      stars,
      duration,
      attempts: getAttemptCount(levelId)
    });
  }
  
  // 关卡失败
  trackLevelFail(levelId, progress, reason) {
    this.trackEvent('level_fail', {
      level_id: levelId,
      progress,
      fail_reason: reason
    });
  }
  
  // 广告相关
  trackAdShow(type, result) {
    this.trackEvent('ad_show', {
      ad_type: type,
      result: result.success,
      error_code: result.error?.code
    });
  }
  
  trackAdClick(type) {
    this.trackEvent('ad_click', { ad_type: type });
  }
  
  // 付费相关
  trackPurchase(itemId, price, currency) {
    this.trackEvent('purchase', {
      item_id: itemId,
      price,
      currency
    });
  }
}
```

---

## 三、第三方SDK

### 3.1 统计SDK

#### 阿拉丁小游戏统计

```javascript
// AldSdk.js
class AldSdk {
  init() {
    // 引入阿拉丁SDK
    require('./ald-stat.js');
  }
  
  // 自定义事件
  track(eventName, params) {
    wx.aldSendEvent(eventName, params);
  }
  
  // 关卡分析
  trackLevel(eventType, levelId) {
    wx.aldLevel.onStart = function() {
      return { levelId };
    };
    wx.aldLevel.onEnd = function() {
      return { levelId, isSuccess: true };
    };
  }
}
```

### 3.2 广告聚合（可选）

```javascript
// 广告聚合管理
class AdAggregation {
  constructor() {
    this.adapters = {
      'wechat': new WechatAdAdapter(),
      'gdt': new GDTAdAdapter(), // 广点通
      'csj': new CSJAdAdapter()  // 穿山甲
    };
    this.currentAdapter = 'wechat';
  }
  
  // 智能选择广告平台
  async getBestAd(type) {
    // 根据填充率、eCPM选择最优平台
    const stats = await this.getPlatformStats();
    return this.adapters[stats.bestPlatform];
  }
}
```

---

## 四、合规与审核

### 4.1 微信审核要求

**必须遵守：**
- [ ] 游戏内容健康，无违规信息
- [ ] 广告展示符合微信规范
- [ ] 用户体验优先，不过度商业化
- [ ] 隐私政策完整，数据合规
- [ ] 未成年人保护机制

**审核材料：**
- 游戏说明文档
- 隐私政策
- 软著/版权证明
- 版号（如需）
- 自测报告

### 4.2 广告合规

**禁止行为：**
- 强制观看广告
- 误导性广告按钮
- 广告关闭按钮过小
- 虚假广告奖励
- 广告与游戏内容混淆

**必须提供：**
- 明确的广告标识
- 便捷的关闭方式
- 承诺的奖励及时发放
- 合理的广告频次

### 4.3 隐私合规

```javascript
// 隐私政策弹窗
class PrivacyPolicy {
  show() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护...',
      confirmText: '同意',
      cancelText: '拒绝',
      success: (res) => {
        if (res.confirm) {
          this.saveConsent(true);
        } else {
          this.exitGame();
        }
      }
    });
  }
  
  // 获取用户授权
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.saveUserInfo(res.userInfo);
      }
    });
  }
}
```

---

## 五、广告配置表

### 5.1 广告位配置

| 广告位ID | 类型 | 尺寸 | 日限额 | 备注 |
|---------|------|------|--------|------|
| ad-reward-01 | 激励视频 | 全屏 | 20次/用户 | 复活用 |
| ad-reward-02 | 激励视频 | 全屏 | 10次/用户 | 双倍奖励 |
| ad-inter-01 | 插屏 | 全屏 | 10次/用户 | 关卡切换 |
| ad-banner-01 | Banner | 自适应 | 无限制 | 主菜单 |

### 5.2 广告展示策略

```json
{
  "adStrategy": {
    "rewarded": {
      "priority": ["ad-reward-01", "ad-reward-02"],
      "fallback": "金币购买",
      "cooldown": 60
    },
    "interstitial": {
      "showAfter": 3,
      "skipFirst": true,
      "maxPerSession": 10
    },
    "banner": {
      "showInScenes": ["main_menu", "level_select"],
      "hideInScenes": ["gameplay"],
      "refresh": 30
    }
  }
}
```

---

**文档版本**：v1.0  
**创建日期**：2026年3月17日
