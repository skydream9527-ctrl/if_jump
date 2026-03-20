"""
种子数据：全10章配置 + 完整关卡数据（第1-2章有完整平台配置，其余章节有基础配置）
"""

CHAPTERS = [
    {"id": 1, "name": "起床第一餐", "subtitle": "早餐篇", "description": "新的一天开始了，阿饱决定从最朴实的早餐开始他的美食之旅。", "theme_color": "#FFF9E6", "unlock_score": 0, "icon": "🍳"},
    {"id": 2, "name": "工作能量站", "subtitle": "午餐篇", "description": "早餐之旅完成，阿饱来到CBD，感受都市白领的午餐文化。", "theme_color": "#74B9FF", "unlock_score": 1000, "icon": "🍱"},
    {"id": 3, "name": "下午茶时光", "subtitle": "下午茶篇", "description": "午后时光，阿饱发现了隐藏在巷子里的网红甜品店。", "theme_color": "#FD79A8", "unlock_score": 3000, "icon": "🧋"},
    {"id": 4, "name": "晚餐大作战", "subtitle": "晚餐篇", "description": "夜幕降临，华灯初上，阿饱来到美食街，迎接最丰盛的挑战。", "theme_color": "#E17055", "unlock_score": 6000, "icon": "🍢"},
    {"id": 5, "name": "宵夜江湖", "subtitle": "宵夜篇", "description": "深夜未眠，阿饱发现美食江湖的另一面——宵夜文化。", "theme_color": "#6C5CE7", "unlock_score": 10000, "icon": "🍜"},
    {"id": 6, "name": "周末美食节", "subtitle": "周末篇", "description": "周末到了，阿饱参加城市美食节，体验各国美食。", "theme_color": "#a29bfe", "unlock_score": 15000, "icon": "🍣"},
    {"id": 7, "name": "节日盛宴", "subtitle": "节日篇", "description": "阿饱经历了四季的美食，现在要挑战各大节日的特色美食。", "theme_color": "#D63031", "unlock_score": 21000, "icon": "🥟"},
    {"id": 8, "name": "环球美食", "subtitle": "世界篇", "description": "阿饱获得赞助，开启环球美食之旅。", "theme_color": "#0984E3", "unlock_score": 28000, "icon": "🍔"},
    {"id": 9, "name": "厨神之路", "subtitle": "进阶篇", "description": "阿饱获得了厨神令，现在要学习厨艺，成为真正的厨神。", "theme_color": "#FDCB6E", "unlock_score": 36000, "icon": "👨‍🍳"},
    {"id": 10, "name": "终极挑战", "subtitle": "终极篇", "description": "阿饱学成归来，面对最终的挑战——传说中的美食神殿。", "theme_color": "#A29BFE", "unlock_score": 45000, "icon": "🏯"},
]


def make_platforms(count: int, base_interval: float = 1.5, theme: str = "default"):
    """Generate platform configs for a level."""
    import random
    platforms = []
    x, y = 100, 400
    for i in range(count):
        interval = base_interval + random.uniform(-0.3, 0.3)
        step = int(interval * 100) + random.randint(-10, 10)
        x += step
        y = 400 + random.randint(-30, 30)
        w = random.choice([60, 80, 100, 120]) if i > 0 else 120
        platforms.append({
            "id": i + 1,
            "type": "standard" if i < count - 1 else "standard",
            "x": x,
            "y": y,
            "width": w,
            "height": 20,
            "theme": theme,
        })
    return platforms


# Chapter 1 levels — 早餐篇
CHAPTER1_LEVELS = [
    {"id": "1-1", "name": "豆浆铺初遇", "description": "阿饱来到第一家老字号豆浆铺", "difficulty": 1, "target_score": 500, "platform_count": 10, "order": 1, "is_boss": False},
    {"id": "1-2", "name": "油条飘香", "description": "豆浆要配油条，跳跃穿越油条丛林", "difficulty": 2, "target_score": 600, "platform_count": 11, "order": 2, "is_boss": False},
    {"id": "1-3", "name": "煎饼摊前", "description": "排队买煎饼，不能掉队", "difficulty": 2, "target_score": 700, "platform_count": 11, "order": 3, "is_boss": False},
    {"id": "1-4", "name": "鸡蛋灌饼", "description": "热气腾腾的鸡蛋灌饼，小心烫脚", "difficulty": 3, "target_score": 800, "platform_count": 12, "order": 4, "is_boss": False},
    {"id": "1-5", "name": "包子铺挑战", "description": "大包子小包子，找准落脚点", "difficulty": 3, "target_score": 900, "platform_count": 12, "order": 5, "is_boss": False},
    {"id": "1-6", "name": "小笼汤包", "description": "轻轻跳跃，别把汤汁洒了", "difficulty": 4, "target_score": 1000, "platform_count": 13, "order": 6, "is_boss": False},
    {"id": "1-7", "name": "豆腐脑之选", "description": "咸甜之争，选择你的阵营", "difficulty": 4, "target_score": 1100, "platform_count": 13, "order": 7, "is_boss": False},
    {"id": "1-8", "name": "粥铺晨光", "description": "慢火熬制的粥，节奏要稳", "difficulty": 4, "target_score": 1200, "platform_count": 13, "order": 8, "is_boss": False},
    {"id": "1-9", "name": "馄饨捞面", "description": "滑溜溜的面条，跳跃要小心", "difficulty": 5, "target_score": 1300, "platform_count": 14, "order": 9, "is_boss": False},
    {"id": "1-10", "name": "早餐之王", "description": "汇集所有早餐，挑战终极早餐组合", "difficulty": 6, "target_score": 1500, "platform_count": 15, "order": 10, "is_boss": True},
]

# Chapter 2 levels — 午餐篇
CHAPTER2_LEVELS = [
    {"id": "2-1", "name": "外卖小哥", "description": "跟随外卖小哥，穿梭写字楼", "difficulty": 3, "target_score": 800, "platform_count": 12, "order": 1, "is_boss": False},
    {"id": "2-2", "name": "排队等位", "description": "热门餐厅需要排队，耐心等待", "difficulty": 3, "target_score": 900, "platform_count": 12, "order": 2, "is_boss": False},
    {"id": "2-3", "name": "快餐风暴", "description": "快节奏的快餐店，速度要快", "difficulty": 4, "target_score": 1000, "platform_count": 13, "order": 3, "is_boss": False},
    {"id": "2-4", "name": "盖浇饭之选", "description": "各色盖浇饭，选择你的最爱", "difficulty": 4, "target_score": 1100, "platform_count": 13, "order": 4, "is_boss": False},
    {"id": "2-5", "name": "面馆老店", "description": "传统手擀面，筋道的口感", "difficulty": 4, "target_score": 1200, "platform_count": 13, "order": 5, "is_boss": False},
    {"id": "2-6", "name": "盒饭时光", "description": "朴实的盒饭，平凡的美味", "difficulty": 5, "target_score": 1300, "platform_count": 14, "order": 6, "is_boss": False},
    {"id": "2-7", "name": "沙拉轻食", "description": "健康沙拉，轻盈跳跃", "difficulty": 5, "target_score": 1400, "platform_count": 14, "order": 7, "is_boss": False},
    {"id": "2-8", "name": "食堂大作战", "description": "公司食堂，抢饭大作战", "difficulty": 5, "target_score": 1500, "platform_count": 14, "order": 8, "is_boss": False},
    {"id": "2-9", "name": "便当DIY", "description": "自己搭配便当，创意无限", "difficulty": 6, "target_score": 1600, "platform_count": 15, "order": 9, "is_boss": False},
    {"id": "2-10", "name": "午餐冠军", "description": "CBD午餐之王诞生", "difficulty": 7, "target_score": 2000, "platform_count": 16, "order": 10, "is_boss": True},
]

# Chapters 3-10 basic levels (simplified)
def gen_chapter_levels(chapter_id: int, chapter_names: list, base_difficulty: int, base_score: int):
    return [
        {
            "id": f"{chapter_id}-{i+1}",
            "name": chapter_names[i],
            "description": f"第{chapter_id}章第{i+1}关",
            "difficulty": base_difficulty + (i // 3),
            "target_score": base_score + i * 200,
            "platform_count": 12 + i,
            "order": i + 1,
            "is_boss": i == 9,
        }
        for i in range(10)
    ]


CHAPTER3_NAMES = ["奶茶排队","芝士奶盖","马卡龙塔","提拉米苏","芒果班戟","双皮奶滑","蛋挞诱惑","舒芙蕾云","冰淇淋塔","下午茶女王"]
CHAPTER4_NAMES = ["烧烤摊前","火锅沸腾","小龙虾大战","烤鱼飘香","串串香集","炸鸡啤酒","私房菜馆","海鲜大排档","烤肉狂欢","夜市之王"]
CHAPTER5_NAMES = ["炒粉摊夜话","砂锅粥香","烧腊之夜","啤酒花园","烤生蚝情","卤味飘香","糖水铺子","深夜饺子","关东煮站","宵夜王者"]
CHAPTER6_NAMES = ["美食街开幕","日式寿司","意式披萨","法式甜点","泰式料理","印度咖喱","韩式烤肉","越南河粉","墨西哥塔可","美食节之星"]
CHAPTER7_NAMES = ["春节饺子","元宵汤圆","清明青团","端午粽子","七夕巧果","中秋月饼","国庆盛宴","万圣南瓜","圣诞大餐","节日之王"]
CHAPTER8_NAMES = ["东京拉面","巴黎可颂","纽约汉堡","罗马意面","曼谷冬阴功","伦敦炸鱼薯条","首尔石锅拌饭","新加坡海南鸡饭","迪拜阿拉伯烤肉","环球美食家"]
CHAPTER9_NAMES = ["刀工练习","火候掌控","调味艺术","摆盘美学","食材知识","菜谱研习","时间管理","创新融合","名厨对决","厨师认证"]
CHAPTER10_NAMES = ["神殿入口","回忆之路","时空穿梭","镜像挑战","极限跳跃","速度考验","耐力比拼","智慧之门","勇气之证","美食之神"]

ALL_LEVELS = (
    CHAPTER1_LEVELS + CHAPTER2_LEVELS
    + gen_chapter_levels(3, CHAPTER3_NAMES, 4, 1200)
    + gen_chapter_levels(4, CHAPTER4_NAMES, 5, 1600)
    + gen_chapter_levels(5, CHAPTER5_NAMES, 6, 2000)
    + gen_chapter_levels(6, CHAPTER6_NAMES, 6, 2500)
    + gen_chapter_levels(7, CHAPTER7_NAMES, 7, 3000)
    + gen_chapter_levels(8, CHAPTER8_NAMES, 7, 3500)
    + gen_chapter_levels(9, CHAPTER9_NAMES, 8, 4000)
    + gen_chapter_levels(10, CHAPTER10_NAMES, 9, 5000)
)
