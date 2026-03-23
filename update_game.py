import os
import re

with open('frontend/src/pages/Game/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace initialization logic
new_init = """    levelsApi.getById(levelId).then(async (data) => {
      setLevelInfo(data)
      let platforms: Platform[] = []
      if (data.platforms_config && data.platforms_config.length > 0) {
        platforms = data.platforms_config.map((p: any) => new Platform(p))
      } else {
        const count = data.platform_count || 12
        platforms = generatePlatforms(count, chapterId)
      }
      const p = new Player(platforms[0].x, platforms[0].top - 14)

      stateRef.current.platforms = platforms
      stateRef.current.player = p
      stateRef.current.cameraX = 0
      stateRef.current.currentPlatform = 0"""
content = re.sub(r"    levelsApi\.getById\(levelId\)\.then\(async \(data\) => \{.*?(?=      const \{ data: sessionData \})", new_init + "\n", content, flags=re.DOTALL)

# Add collision and mechanics logic
check_land_old = """        const checkLand = (plat: Platform, idx: number) => {
          if (!s.player) return
          const px = s.player.x, py = s.player.y + 14
          if (s.player.vy > 0 &&
              px >= plat.left && px <= plat.right &&
              py >= plat.top && py <= plat.bottom + 10) {
            s.player.land(plat)
            s.currentPlatform = idx

            // Score
            const isPerfect = plat.inCenterZone(px)
            if (isPerfect) {"""

check_land_new = """        const checkLand = (plat: Platform, idx: number) => {
          if (!s.player) return
          const px = s.player.x, py = s.player.y + 14
          if (s.player.vy > 0 &&
              px >= plat.left && px <= plat.right &&
              py >= plat.top && py <= plat.bottom + 10) {
              
            // Check obstacle collision on landing
            if (plat.hasObstacle && Math.abs(px - plat.obstacleX) < 20) {
              s.player.bounce()
              gameStore.addScore(-10)
              s.floatTexts.show(px, py - 30, "-10", "#FF6B6B")
              return
            }

            // Wobble trigger
            if (plat.isWobble) {
              const offsetRatio = (px - plat.x) / (plat.width / 2)
              plat.triggerWobble(offsetRatio)
            }

            s.player.land(plat)
            s.currentPlatform = idx

            // Score
            const isPerfect = plat.inCenterZone(px)
            if (isPerfect) {"""
content = content.replace(check_land_old, check_land_new)

# Add timer check and waiting mechanism logic
update_old = """      s.player.updateCharge(dt)
      s.player.update(dt, GRAVITY)
      s.platforms.forEach(p => p.update(dt))
      s.particles.update(dt)
      s.floatTexts.update(dt)

      // Camera follows player"""

update_new = """      s.player.updateCharge(dt)
      s.player.update(dt, GRAVITY)
      s.platforms.forEach(p => p.update(dt))
      s.particles.update(dt)
      s.floatTexts.update(dt)
      
      // Handle waiting mechanism
      const currentP = s.platforms[s.currentPlatform]
      if (currentP && currentP.waitTimer > 0 && s.player.state === 'idle') {
        currentP.waitElapsed += dt
        if (currentP.waitElapsed > currentP.waitTimer + 2 && !currentP.waitFailed) {
          currentP.waitFailed = true
          s.floatTexts.show(currentP.x, currentP.y - 40, "太慢啦！", "#FF6B6B")
          gameStore.addScore(-5)
        }
      }

      // Camera follows player"""
content = content.replace(update_old, update_new)

# Check branching jump
jump_check_old = """        if (np) checkLand(np, s.currentPlatform + 1)
        // Also check current (re-land)"""

jump_check_new = """        if (np) checkLand(np, s.currentPlatform + 1)
        
        // Check branching (for level 1-7)
        const branchP = s.platforms.find(p => p.id > s.currentPlatform + 1 && p.id <= s.currentPlatform + 3 && p.theme !== np?.theme)
        if (branchP && s.player.x > branchP.left - 50) checkLand(branchP, s.platforms.indexOf(branchP))
        
        // Also check current (re-land)"""
content = content.replace(jump_check_old, jump_check_new)

# Pass isCurrent to draw
draw_old = """      // Platforms
      s.platforms.forEach(p => p.draw(ctx))"""

draw_new = """      // Platforms
      s.platforms.forEach((p, idx) => p.draw(ctx, idx === s.currentPlatform))"""
content = content.replace(draw_old, draw_new)

with open('frontend/src/pages/Game/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Game loop updated!")