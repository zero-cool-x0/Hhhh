export type PlayerState = 'TYPING' | 'SLACKING' | 'BUSTED';

export type BossType = 'MANAGER' | 'HR' | 'CEO';

export type BossState = 'AWAY' | 'APPROACHING' | 'AT_DESK' | 'INSPECTING' | 'LEAVING';

export interface Skin {
  id: string;
  name: string;
  tagline: string;
  price: number;
  unlocked: boolean;
  avatarColor: string;
  hairColor: string;
  shirtColor: string;
  accessory: string;
  specialPerk: string;
}

export interface PowerUpItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  durationSec: number;
  owned: number;
}

export interface GameStats {
  highScore: number;
  totalCoins: number;
  gamesPlayed: number;
  timesBusted: number;
  bestDay: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}
