import json

def get_chapter1_levels():
    # Helper to generate platforms
    def p(id, x, y, w, h, theme, type="standard", **kwargs):
        plat = {"id": id, "x": x, "y": y, "width": w, "height": h, "theme": theme, "type": type}
        plat.update(kwargs)
        return plat

    levels = []

    # 1-1 豆浆铺初遇
    plats_1_1 = []
    x, y = 120, 400
    for i in range(10):
        plats_1_1.append(p(i+1, x, y, 100, 20, "ch1", type="standard"))
        x += 150 # Fixed 1.5 units
    levels.append({
        "id": "1-1", "name": "豆浆铺初遇", "description": "阿饱来到第一家老字号豆浆铺", 
        "difficulty": 1, "target_score": 500, "platform_count": 10, "order": 1, "is_boss": False,
        "platforms_config": plats_1_1,
        "mechanics_config": {"tutorial": True}
    })

    # 1-2 油条飘香
    plats_1_2 = []
    x, y = 120, 400
    for i in range(12):
        has_obstacle = (i+1) in [5, 8, 11]
        plats_1_2.append(p(i+1, x, y, 50, 20, "ch1", type="standard", has_obstacle=has_obstacle, obstacle_type="youtiao"))
        x += 120 + (i % 3) * 30
    levels.append({
        "id": "1-2", "name": "油条飘香", "description": "豆浆要配油条，跳跃穿越油条丛林", 
        "difficulty": 2, "target_score": 600, "platform_count": 12, "order": 2, "is_boss": False,
        "platforms_config": plats_1_2,
        "mechanics_config": {"obstacles": True}
    })

    # 1-3 煎饼摊前
    plats_1_3 = []
    x, y = 120, 400
    for i in range(12):
        wait = (i+1) in [6, 9, 12]
        plats_1_3.append(p(i+1, x, y, 100, 20, "ch1", type="standard", wait_timer=3 if wait else 0))
        gap = 130 if i < 4 else (170 if i < 8 else 220)
        x += gap
    levels.append({
        "id": "1-3", "name": "煎饼摊前", "description": "排队买煎饼，不能掉队", 
        "difficulty": 2, "target_score": 700, "platform_count": 12, "order": 3, "is_boss": False,
        "platforms_config": plats_1_3,
        "mechanics_config": {"wait_timer": True}
    })

    # 1-4 鸡蛋灌饼
    plats_1_4 = []
    x, y = 120, 400
    for i in range(12):
        steam = (i+1) in [3, 6, 9]
        plats_1_4.append(p(i+1, x, y, 100, 20, "ch1", type="standard", has_steam=steam))
        x += 140 + (i % 2) * 50
    levels.append({
        "id": "1-4", "name": "鸡蛋灌饼", "description": "热气腾腾的鸡蛋灌饼，小心烫脚", 
        "difficulty": 3, "target_score": 800, "platform_count": 12, "order": 4, "is_boss": False,
        "platforms_config": plats_1_4,
        "mechanics_config": {"steam": True}
    })

    # 1-5 包子铺挑战
    plats_1_5 = []
    x, y = 120, 400
    sizes = [150, 100, 50]
    for i in range(14):
        w = sizes[i % 3]
        plats_1_5.append(p(i+1, x, y, w, 20, "ch1", type="standard", size_type=["large", "medium", "small"][i % 3]))
        x += 120 + (i % 3) * 20
    levels.append({
        "id": "1-5", "name": "包子铺挑战", "description": "大包子小包子，找准落脚点", 
        "difficulty": 3, "target_score": 900, "platform_count": 14, "order": 5, "is_boss": False,
        "platforms_config": plats_1_5,
        "mechanics_config": {}
    })

    # 1-6 小笼汤包
    plats_1_6 = []
    x, y = 120, 400
    for i in range(12):
        plats_1_6.append(p(i+1, x, y, 80, 20, "ch1", type="standard", is_wobble=True))
        x += 150
    levels.append({
        "id": "1-6", "name": "小笼汤包", "description": "轻轻跳跃，别把汤汁洒了", 
        "difficulty": 4, "target_score": 1000, "platform_count": 12, "order": 6, "is_boss": False,
        "platforms_config": plats_1_6,
        "mechanics_config": {"high_precision": True}
    })

    # 1-7 豆腐脑之选
    plats_1_7 = []
    x, y = 120, 400
    # Main path 1-3
    for i in range(3):
        plats_1_7.append(p(i+1, x, y, 100, 20, "ch1", type="standard"))
        x += 150
    
    # Branching at x
    split_x = x
    # Salt branch (up)
    sx, sy = split_x, y - 60
    for i in range(4, 7):
        plats_1_7.append(p(i, sx, sy, 120, 20, "ch1_salt", type="standard", branch="salt"))
        sx += 150
    # Sweet branch (down)
    swx, swy = split_x, y + 60
    for i in range(7, 10):
        plats_1_7.append(p(i, swx, swy, 60, 20, "ch1_sweet", type="standard", branch="sweet"))
        swx += 150
        
    # Merge at 10
    merge_x = max(sx, swx)
    plats_1_7.append(p(10, merge_x, y, 100, 20, "ch1", type="standard"))
    
    levels.append({
        "id": "1-7", "name": "豆腐脑之选", "description": "咸甜之争，选择你的阵营", 
        "difficulty": 4, "target_score": 1100, "platform_count": 10, "order": 7, "is_boss": False,
        "platforms_config": plats_1_7,
        "mechanics_config": {"branching": True}
    })

    # 1-8 粥铺晨光
    plats_1_8 = []
    x, y = 120, 400
    for i in range(13):
        plats_1_8.append(p(i+1, x, y, 120, 20, "ch1", type="moving", move_speed=30, move_range=50))
        x += 160
    levels.append({
        "id": "1-8", "name": "粥铺晨光", "description": "慢火熬制的粥，节奏要稳", 
        "difficulty": 4, "target_score": 1200, "platform_count": 13, "order": 8, "is_boss": False,
        "platforms_config": plats_1_8,
        "mechanics_config": {"patience": True}
    })

    # 1-9 馄饨捞面
    plats_1_9 = []
    x, y = 120, 400
    for i in range(14):
        has_obs = (i+1) in [4, 8]
        plats_1_9.append(p(i+1, x, y, 110, 20, "ch1", type="standard", is_slippery=True, has_obstacle=has_obs, obstacle_type="wonton"))
        x += 150
    levels.append({
        "id": "1-9", "name": "馄饨捞面", "description": "滑溜溜的面条，跳跃要小心", 
        "difficulty": 5, "target_score": 1300, "platform_count": 14, "order": 9, "is_boss": False,
        "platforms_config": plats_1_9,
        "mechanics_config": {"slippery": True}
    })

    # 1-10 早餐之王
    plats_1_10 = []
    x, y = 120, 400
    for i in range(14):
        t = "standard"
        obs = None
        steam = False
        wait = 0
        wobble = False
        slip = False
        w = 100
        if i in [3, 4]: obs = "youtiao"; w = 50
        elif i in [5, 6]: wait = 3
        elif i == 7: steam = True
        elif i in [8, 9, 10]: w = [150, 100, 50][(i-8)%3]
        elif i == 11: wobble = True; w = 80
        elif i in [12, 13]: t = "moving"; w = 120
        
        plats_1_10.append(p(i+1, x, y, w, 20, "ch1", type=t, 
            has_obstacle=(obs is not None), obstacle_type=obs,
            wait_timer=wait, has_steam=steam, is_wobble=wobble, is_slippery=slip))
        x += 150
        
    # Boss platform
    plats_1_10.append(p(15, x + 50, y, 250, 40, "ch1_boss", type="standard", is_boss=True))
    
    levels.append({
        "id": "1-10", "name": "早餐之王", "description": "汇集所有早餐，挑战终极早餐组合", 
        "difficulty": 6, "target_score": 1500, "platform_count": 15, "order": 10, "is_boss": True,
        "platforms_config": plats_1_10,
        "mechanics_config": {"boss_fight": True}
    })
    
    return levels

import os
import re

file_path = "backend/app/seed/levels_data.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Generate new CHAPTER1_LEVELS python code
levels = get_chapter1_levels()
new_code = "CHAPTER1_LEVELS = [\n"
for l in levels:
    new_code += f"    {repr(l)},\n"
new_code += "]\n"

# Replace the old CHAPTER1_LEVELS block
pattern = re.compile(r"CHAPTER1_LEVELS\s*=\s*\[.*?\]\n", re.DOTALL)
new_content = pattern.sub(new_code, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated CHAPTER1_LEVELS in levels_data.py")
