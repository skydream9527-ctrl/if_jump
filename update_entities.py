import os

with open('frontend/src/game/entities.ts', 'w') as f:
    f.write("""// ===== Platform Entity =====
import { PlatformData } from '../api/client'

export interface PlatformConfig extends PlatformData {}

const PLATFORM_COLORS: Record<string, string[]> = {
  default: ['#FF9F43', '#E67E22'],
  ch1: ['#FFF9E6', '#F7DC6F'],
  ch1_salt: ['#8D6E63', '#5D4037'],
  ch1_sweet: ['#FFB74D', '#F57C00'],
  ch1_boss: ['#FFD700', '#F39C12'],
  ch2: ['#74B9FF', '#0984E3'],
  ch3: ['#FD79A8', '#E84393'],
  ch4: ['#E17055', '#C0392B'],
  ch5: ['#6C5CE7', '#5A4BD1'],
  ch6: ['#a29bfe', '#7986cb'],
  ch7: ['#D63031', '#B71C1C'],
  ch8: ['#0984E3', '#1565C0'],
  ch9: ['#FDCB6E', '#F39C12'],
  ch10: ['#A29BFE', '#7B68EE'],
}

export class Platform {
  id: number; x: number; y: 
with opwid    f.write("""// ===== Platform Entity =====
import { PlatformData : import { PlatformData } from '../api/cliee
export interface PlatformConfig extends PlatformDabst
const PLATFORM_COLORS: Record<string, string[]> = {
 ; o  default: ['#FF9F43', '#E67E22'],0;  ch1: ['#FFF9E6', '#F7DC6F'],
  er  ch1_salt: ['#8D6E63', '#5D4037