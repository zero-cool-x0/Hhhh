import { Skin, PowerUpItem, BossType } from './types';

export interface BossProfile {
  type: BossType;
  name: string;
  title: string;
  desc: string;
  hairColor: string;
  suitColor: string;
  tieColor: string;
  warningDuration: number; // Seconds warning ! stays before turning
  inspectDurationMin: number;
  inspectDurationMax: number;
  pauseChance: number; // Chance to fake-out pause
  phrases: string[];
}

export const BOSS_PROFILES: Record<BossType, BossProfile> = {
  MANAGER: {
    type: 'MANAGER',
    name: 'Mr. Henderson',
    title: 'Middle Manager',
    desc: 'Regular patrol, predictable coffee sips, easily satisfied by clicking sounds.',
    hairColor: '#475569',
    suitColor: '#1e293b',
    tieColor: '#ef4444',
    warningDuration: 1.6,
    inspectDurationMin: 2.2,
    inspectDurationMax: 3.5,
    pauseChance: 0.1,
    phrases: [
      "Did you finish those Q3 spreadsheets?",
      "Synergizing our key core deliverables!",
      "I don't pay you to stare at pixels!",
      "Salary deduction incoming!",
      "Are you scrolling TikTok again?",
      "Can we take this offline?",
      "Let's touch base on the action items."
    ]
  },
  HR: {
    type: 'HR',
    name: 'Karen from HR',
    title: 'Strict HR Director',
    desc: 'Sneaky steps, audits your desk, does sudden fake-out turnarounds!',
    hairColor: '#78350f',
    suitColor: '#4c0519',
    tieColor: '#f43f5e',
    warningDuration: 1.15,
    inspectDurationMin: 2.8,
    inspectDurationMax: 4.2,
    pauseChance: 0.45,
    phrases: [
      "I noticed your status was 'Away' for 42 seconds.",
      "This is not company handbook compliant!",
      "I can smell non-work tab activity.",
      "Your mouse movement speed is substandard.",
      "Mandatory wellness webinar at 8 AM tomorrow!",
      "Is that personal shopping in an incognito tab?!",
      "I’m putting a note in your permanent record."
    ]
  },
  CEO: {
    type: 'CEO',
    name: 'Lord BigBoss',
    title: 'Surprise Billionaire CEO',
    desc: 'Blazing fast, laser focused, high stakes inspections with no mercy!',
    hairColor: '#e2e8f0',
    suitColor: '#0f172a',
    tieColor: '#eab308',
    warningDuration: 0.8,
    inspectDurationMin: 1.8,
    inspectDurationMax: 3.2,
    pauseChance: 0.3,
    phrases: [
      "My private jet fuel costs more than your salary!",
      "Are you 10x disruptive right now?!",
      "Where is my AI blockchain presentation?!",
      "I sleep 2 hours a night, you should too!",
      "I can see your screen reflection in my Rolex!",
      "Work harder or I will replace you with a bash script!",
      "Show me extreme hustle!"
    ]
  }
};

export const COLLEAGUE_WHISPERS: string[] = [
  "Psst! Boss is coming from corridor B!",
  "Alt+Tab right now bro!!",
  "Close your cat meme tab!",
  "Karen looks furious today...",
  "Pretend to read a PDF fast!",
  "He's right behind the water cooler!",
  "Did you submit the budget?!",
  "Cover your screen with a spreadsheet!",
  "Act like you are deeply pondering code!",
  "Coffee machine is broken anyway..."
];

export const FIRED_REASONS: string[] = [
  "Caught ordering 45 pepperoni pizzas using the corporate emergency card.",
  "Accidentally screen-shared your 8-hour Lo-Fi anime live stream to the board of directors.",
  "Microwaved leftover fish and spicy curry in the breakroom for 17 consecutive minutes.",
  "Fired because you challenged the HR Director to a dance-off during the quarterly fiscal audit.",
  "Caught taking a 3-hour 'quick coffee run' and returning with a live flamingo.",
  "Replied 'k' to the CEO’s company-wide 4,500-word emotional manifesto.",
  "Set up a camping tent and barbecue grill in the server room and called it 'Hybrid Work'.",
  "Caught attempting to train an AI model to automatically fake your mouse movements.",
  "Accidentally unmuted on Zoom while singing a dramatic karaoke ballad to your cat.",
  "Caught building a life-sized replica of the Eiffel Tower using only sticky notes and paper clips.",
  "Replaced the company mission statement on the homepage with the recipe for grandma's brownies.",
  "Caught sleeping behind three coats in the coat closet at 2:00 PM.",
  "Sent a meme about the boss directly to the boss, then tried to claim you were hacked by martians.",
  "Caught mining cryptocurrency on the smart water dispenser.",
  "Showed up to the client meeting wearing a bathrobe and sunglasses."
];

export const INITIAL_SKINS: Skin[] = [
  {
    id: 'intern',
    name: 'Intern Terry',
    tagline: 'Fueled by anxiety and free instant coffee.',
    price: 0,
    unlocked: true,
    avatarColor: '#fde047',
    hairColor: '#1e293b',
    shirtColor: '#3b82f6',
    accessory: 'ID Badge',
    specialPerk: 'Standard all-around slacker.'
  },
  {
    id: 'sleepy_panda',
    name: 'Sleepy Panda',
    tagline: 'Types with eyes closed. Can sleep anywhere.',
    price: 150,
    unlocked: false,
    avatarColor: '#f8fafc',
    hairColor: '#0f172a',
    shirtColor: '#10b981',
    accessory: 'Panda Onesie & Sleep Mask',
    specialPerk: '+15% coin spawn rate.'
  },
  {
    id: 'pro_slacker',
    name: 'Pro Slacker Brad',
    tagline: 'Has 4 monitors, all displaying mobile games.',
    price: 350,
    unlocked: false,
    avatarColor: '#fed7aa',
    hairColor: '#b45309',
    shirtColor: '#ec4899',
    accessory: 'Hawaiian Shirt & Sunglasses',
    specialPerk: 'Fun meter fills 20% faster.'
  },
  {
    id: 'nerd_coder',
    name: 'Nerd Coder Zoe',
    tagline: 'Compiles code when slacking, hacks mainframe when typing.',
    price: 600,
    unlocked: false,
    avatarColor: '#fecdd3',
    hairColor: '#8b5cf6',
    shirtColor: '#6366f1',
    accessory: 'RGB Mechanical Keyboards',
    specialPerk: 'Typing score multiplier +25%.'
  },
  {
    id: 'coffee_goblin',
    name: 'Coffee Goblin Gus',
    tagline: 'Blood type: 100% Arabica dark roast.',
    price: 900,
    unlocked: false,
    avatarColor: '#fed7aa',
    hairColor: '#7c2d12',
    shirtColor: '#d97706',
    accessory: 'Triple Coffee Mug Ring',
    specialPerk: 'Coffee boost lasts 4 seconds longer.'
  },
  {
    id: 'cyber_agent',
    name: 'Shadow Executive 007',
    tagline: 'Infiltrated the company to browse Reddit in peace.',
    price: 1400,
    unlocked: false,
    avatarColor: '#cbd5e1',
    hairColor: '#09090b',
    shirtColor: '#0284c7',
    accessory: 'Holographic Visor',
    specialPerk: '+0.4s reaction time buffer on alerts.'
  }
];

export const INITIAL_POWERUPS: PowerUpItem[] = [
  {
    id: 'coffee',
    name: 'Dark Roast Turbo Mug',
    description: 'Increases typing points and work score by 2x for 8 seconds.',
    icon: '☕',
    cost: 50,
    durationSec: 8,
    owned: 1
  },
  {
    id: 'sunglasses',
    name: 'Incognito Sunglasses',
    description: 'Grants 2 extra seconds of stealth immunity even when the boss looks!',
    icon: '🕶️',
    cost: 90,
    durationSec: 10,
    owned: 1
  },
  {
    id: 'donut',
    name: 'Glazed Energy Donut',
    description: 'Emergency sugar rush! Instantly restores 1 lost life/heart.',
    icon: '🍩',
    cost: 120,
    durationSec: 0,
    owned: 0
  }
];
