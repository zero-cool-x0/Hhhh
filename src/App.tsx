import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, BossType, BossState, Skin, PowerUpItem, FloatingText } from './types';
import { BOSS_PROFILES, COLLEAGUE_WHISPERS, FIRED_REASONS, INITIAL_SKINS, INITIAL_POWERUPS } from './gameData';
import { sounds } from './sound';
import { GameCanvas } from './GameCanvas';
import { ShopModal } from './ShopModal';
import { BannerAd, RewardedAdModal, InterstitialAdModal } from './AdComponents';
import {
  Volume2,
  VolumeX,
  ShoppingBag,
  Heart,
  Flame,
  Award,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Shield,
  Coffee,
  HelpCircle,
  Tv,
  Gamepad2,
  AlertTriangle,
  X
} from 'lucide-react';

type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export default function App() {
  // Game Flow State
  const [gameMode, setGameMode] = useState<GameMode>('TITLE');
  const [day, setDay] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('boss_escape_highscore') || '0', 10);
  });
  const [coins, setCoins] = useState<number>(() => {
    return parseInt(localStorage.getItem('boss_escape_coins') || '120', 10);
  });
  const [lives, setLives] = useState<number>(3);
  const [workdayMinutes, setWorkdayMinutes] = useState<number>(540); // 9:00 AM (9*60)
  const [funMeter, setFunMeter] = useState<number>(0); // 0 to 100
  const [combo, setCombo] = useState<number>(1);
  const [isSuperSlacker, setIsSuperSlacker] = useState<boolean>(false);
  const [hasRevived, setHasRevived] = useState<boolean>(false);
  const [gameOverCount, setGameOverCount] = useState<number>(0);
  const [firedReason, setFiredReason] = useState<string>('');

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.muted);

  // Shop & Modals
  const [skins, setSkins] = useState<Skin[]>(() => {
    const saved = localStorage.getItem('boss_escape_skins');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SKINS;
  });
  const [equippedSkinId, setEquippedSkinId] = useState<string>(() => {
    return localStorage.getItem('boss_escape_equipped_skin') || 'intern';
  });
  const [powerUps, setPowerUps] = useState<PowerUpItem[]>(() => {
    const saved = localStorage.getItem('boss_escape_powerups');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_POWERUPS;
  });
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Active Power-up Timers
  const [coffeeTimer, setCoffeeTimer] = useState<number>(0);
  const [sunglassesTimer, setSunglassesTimer] = useState<number>(0);

  // Ads Modals State
  const [showRewardedAd, setShowRewardedAd] = useState<boolean>(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState<boolean>(false);

  // Character & Boss State
  const [playerState, setPlayerState] = useState<PlayerState>('TYPING');
  const [bossType, setBossType] = useState<BossType>('MANAGER');
  const [bossState, setBossState] = useState<BossState>('AWAY');
  const [bossProgress, setBossProgress] = useState<number>(0);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [warningCountdown, setWarningCountdown] = useState<number>(0);
  const [bossSpeech, setBossSpeech] = useState<string | null>(null);
  const [colleagueSpeech, setColleagueSpeech] = useState<string | null>(null);
  const [cameraShake, setCameraShake] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Refs
  const isHoldingRef = useRef<boolean>(false);
  const bossTimerRef = useRef<number>(0);
  const bossInspectTimerRef = useRef<number>(0);
  const bossWarningDurationRef = useRef<number>(1.6);
  const slackingTickRef = useRef<number>(0);

  // Active skin
  const currentSkin = skins.find(s => s.id === equippedSkinId) || skins[0];

  // LocalStorage persistence
  useEffect(() => {
    localStorage.setItem('boss_escape_highscore', String(highScore));
  }, [highScore]);

  useEffect(() => {
    localStorage.setItem('boss_escape_coins', String(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('boss_escape_skins', JSON.stringify(skins));
  }, [skins]);

  useEffect(() => {
    localStorage.setItem('boss_escape_equipped_skin', equippedSkinId);
  }, [equippedSkinId]);

  useEffect(() => {
    localStorage.setItem('boss_escape_powerups', JSON.stringify(powerUps));
  }, [powerUps]);

  // Floating text feedback
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#fde047') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color, alpha: 1, vy: -1.4 }]);
  }, []);

  // Format workday clock
  const formatTime = (minutes: number) => {
    const totalMinutes = Math.min(1020, Math.max(540, minutes));
    const h24 = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const h12 = h24 > 12 ? h24 - 12 : h24;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${h12}:${mStr} ${ampm}`;
  };

  // Start new workday shift
  const startShift = useCallback(() => {
    setScore(0);
    setLives(3);
    setWorkdayMinutes(540); // 9:00 AM
    setFunMeter(0);
    setCombo(1);
    setIsSuperSlacker(false);
    setHasRevived(false);
    setPlayerState('TYPING');
    setBossType('MANAGER');
    setBossState('AWAY');
    setBossProgress(0);
    setIsWarning(false);
    setBossSpeech(null);
    setColleagueSpeech(null);
    setCameraShake(0);
    setCoffeeTimer(0);
    setSunglassesTimer(0);
    bossTimerRef.current = 4;
    setGameMode('PLAYING');
    sounds.playPowerUp();
  }, []);

  // Use power-up from hotbar
  const usePowerUp = (id: string) => {
    const item = powerUps.find(p => p.id === id);
    if (!item || item.owned <= 0) return;

    if (id === 'coffee') {
      const extra = currentSkin.id === 'coffee_goblin' ? 4 : 0;
      setCoffeeTimer(item.durationSec + extra);
      addFloatingText('☕ TURBO COFFEE ACTIVATED!', window.innerWidth * 0.5, 180, '#f97316');
      sounds.playPowerUp();
      if (navigator.vibrate) navigator.vibrate([40]);
    } else if (id === 'sunglasses') {
      setSunglassesTimer(item.durationSec);
      addFloatingText('🕶️ INCOGNITO SHADES ON!', window.innerWidth * 0.5, 180, '#38bdf8');
      sounds.playPowerUp();
      if (navigator.vibrate) navigator.vibrate([40]);
    } else if (id === 'donut') {
      if (lives < 3) {
        setLives(prev => Math.min(3, prev + 1));
        addFloatingText('🍩 +1 LIFE RESTORED!', window.innerWidth * 0.5, 180, '#ec4899');
        sounds.playRevive();
        if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      } else {
        addFloatingText('Full Health Already!', window.innerWidth * 0.5, 180, '#94a3b8');
        return;
      }
    }

    setPowerUps(prev =>
      prev.map(p => (p.id === id ? { ...p, owned: p.owned - 1 } : p))
    );
  };

  // Buy Skin
  const handleBuySkin = (skin: Skin) => {
    if (coins < skin.price) return false;
    setCoins(prev => prev - skin.price);
    setSkins(prev =>
      prev.map(s => (s.id === skin.id ? { ...s, unlocked: true } : s))
    );
    setEquippedSkinId(skin.id);
    sounds.playCoin();
    return true;
  };

  // Buy Powerup
  const handleBuyPowerUp = (item: PowerUpItem) => {
    if (coins < item.cost) return false;
    setCoins(prev => prev - item.cost);
    setPowerUps(prev =>
      prev.map(p => (p.id === item.id ? { ...p, owned: p.owned + 1 } : p))
    );
    sounds.playCoin();
    return true;
  };

  // Revive from Rewarded Ad
  const handleReviveFromAd = () => {
    setShowRewardedAd(false);
    setLives(1);
    setHasRevived(true);
    setPlayerState('TYPING');
    setBossState('AWAY');
    setIsWarning(false);
    setCameraShake(0);
    setGameMode('PLAYING');
    bossTimerRef.current = 4.0;
    addFloatingText('✨ REVIVED! +1 LIFE', window.innerWidth * 0.5, 200, '#22c55e');
    sounds.playRevive();
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  };

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  // Mobile & Desktop Action Handlers
  const handleStartSlack = useCallback(() => {
    if (gameMode !== 'PLAYING') return;
    isHoldingRef.current = true;
    setPlayerState('SLACKING');
    if (navigator.vibrate) navigator.vibrate([15]);
  }, [gameMode]);

  const handleStopSlack = useCallback(() => {
    if (gameMode !== 'PLAYING') return;
    isHoldingRef.current = false;
    setPlayerState('TYPING');
  }, [gameMode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameMode === 'TITLE') {
          startShift();
        } else if (gameMode === 'PLAYING') {
          handleStartSlack();
        }
      } else if (e.code === 'Escape') {
        if (gameMode === 'PLAYING') {
          setGameMode('PAUSED');
        } else if (gameMode === 'PAUSED') {
          setGameMode('PLAYING');
        }
      } else if (e.key === '1') {
        usePowerUp('coffee');
      } else if (e.key === '2') {
        usePowerUp('sunglasses');
      } else if (e.key === '3') {
        usePowerUp('donut');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStopSlack();
      }
    };

    const handleBlur = () => {
      handleStopSlack();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameMode, handleStartSlack, handleStopSlack, startShift]);

  // Main 1s Game Interval
  useEffect(() => {
    if (gameMode !== 'PLAYING') return;

    const interval = setInterval(() => {
      // 1. Advance Workday
      setWorkdayMinutes(prev => {
        const next = prev + 3.5;
        if (next >= 1020) {
          setGameMode('VICTORY');
          setCoins(c => c + 150);
          sounds.playRevive();
          return 1020;
        }

        if (next >= 900) {
          setBossType('CEO');
        } else if (next >= 720) {
          setBossType('HR');
        } else {
          setBossType('MANAGER');
        }

        return next;
      });

      // 2. Active powerup timers
      setCoffeeTimer(prev => Math.max(0, prev - 1));
      setSunglassesTimer(prev => Math.max(0, prev - 1));

      // 3. Scoring
      if (isHoldingRef.current) {
        // Slacking
        sounds.playSlackingBeep();

        const perkRate = currentSkin.id === 'pro_slacker' ? 1.25 : 1.0;
        setFunMeter(prev => {
          const next = Math.min(100, prev + 6 * perkRate);
          if (next >= 100 && !isSuperSlacker) {
            setIsSuperSlacker(true);
            addFloatingText('🔥 FRENZY! 3X SCORE', window.innerWidth * 0.5, 220, '#ec4899');
            setTimeout(() => {
              setIsSuperSlacker(false);
              setFunMeter(0);
            }, 5000);
          }
          return next;
        });

        setCombo(prev => Math.min(5, prev + 0.15));

        const multiplier = (isSuperSlacker ? 3 : 1) * Math.floor(combo);
        const pts = 25 * multiplier;
        setScore(s => {
          const newScore = s + pts;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });

        // Coin drops
        slackingTickRef.current += 1;
        const coinChance = currentSkin.id === 'sleepy_panda' ? 0.38 : 0.22;
        if (Math.random() < coinChance) {
          const earned = Math.random() > 0.7 ? 3 : 1;
          setCoins(c => c + earned);
          sounds.playCoin();
          addFloatingText(`+${earned} 🪙`, window.innerWidth * 0.5 + (Math.random() - 0.5) * 60, 260, '#fde047');
        }
      } else {
        // Typing mode
        sounds.playTypingClick();
        setCombo(1);
        setFunMeter(prev => Math.max(0, prev - 2));

        const nerdMultiplier = currentSkin.id === 'nerd_coder' ? 1.25 : 1.0;
        const coffeeMultiplier = coffeeTimer > 0 ? 2.0 : 1.0;
        const workPts = Math.round(5 * nerdMultiplier * coffeeMultiplier);
        setScore(s => {
          const newScore = s + workPts;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
      }

      setCameraShake(prev => Math.max(0, prev - 0.2));

      setFloatingTexts(prev =>
        prev
          .map(t => ({ ...t, y: t.y + t.vy, alpha: t.alpha - 0.04 }))
          .filter(t => t.alpha > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, isSuperSlacker, combo, highScore, currentSkin, coffeeTimer, addFloatingText]);

  // Boss AI Patrol Loop
  useEffect(() => {
    if (gameMode !== 'PLAYING') return;

    const currentBossProfile = BOSS_PROFILES[bossType];
    const reactionBuffer = currentSkin.id === 'cyber_agent' ? 0.4 : 0;
    const baseWarningTime = currentBossProfile.warningDuration + reactionBuffer;

    const bossInterval = setInterval(() => {
      if (bossState === 'AWAY') {
        bossTimerRef.current -= 0.1;
        if (bossTimerRef.current <= 0) {
          // Boss starts approaching
          setBossState('APPROACHING');
          setBossProgress(0);
          setIsWarning(true);
          setWarningCountdown(baseWarningTime);
          bossWarningDurationRef.current = baseWarningTime;
          sounds.playWarningAlert();
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

          if (Math.random() < 0.65) {
            const whisper = COLLEAGUE_WHISPERS[Math.floor(Math.random() * COLLEAGUE_WHISPERS.length)];
            setColleagueSpeech(whisper);
            setTimeout(() => setColleagueSpeech(null), 2500);
          }
        }
      } else if (bossState === 'APPROACHING') {
        setBossProgress(prev => {
          const next = prev + 0.08;
          if (next >= 1) {
            setBossState('AT_DESK');
            setIsWarning(false);
            bossInspectTimerRef.current =
              currentBossProfile.inspectDurationMin +
              Math.random() * (currentBossProfile.inspectDurationMax - currentBossProfile.inspectDurationMin);

            const phrase = currentBossProfile.phrases[Math.floor(Math.random() * currentBossProfile.phrases.length)];
            setBossSpeech(phrase);
            return 1;
          }
          return next;
        });

        setWarningCountdown(prev => Math.max(0, prev - 0.1));
      } else if (bossState === 'AT_DESK') {
        setBossState('INSPECTING');
      } else if (bossState === 'INSPECTING') {
        bossInspectTimerRef.current -= 0.1;

        if (isHoldingRef.current) {
          if (sunglassesTimer > 0) {
            addFloatingText('🕶️ SHADES PROTECTED YOU!', window.innerWidth * 0.5, 200, '#38bdf8');
          } else {
            // BUSTED!
            sounds.playBusted();
            setPlayerState('BUSTED');
            setCameraShake(1.3);
            isHoldingRef.current = false;

            if (navigator.vibrate) {
              navigator.vibrate([150, 50, 200]);
            }

            setLives(prevLives => {
              const remaining = prevLives - 1;
              if (remaining <= 0) {
                setTimeout(() => {
                  setGameMode('GAMEOVER');
                  sounds.playGameOver();
                  const reason = FIRED_REASONS[Math.floor(Math.random() * FIRED_REASONS.length)];
                  setFiredReason(reason);

                  const newCount = gameOverCount + 1;
                  setGameOverCount(newCount);
                  if (newCount % 3 === 0) {
                    setShowInterstitialAd(true);
                  }
                }, 800);
                return 0;
              }
              setTimeout(() => {
                setPlayerState('TYPING');
              }, 1200);
              return remaining;
            });

            setBossState('LEAVING');
            setBossProgress(1);
          }
        }

        if (bossInspectTimerRef.current <= 0) {
          setBossState('LEAVING');
          setBossProgress(1);
          setBossSpeech(null);
        }
      } else if (bossState === 'LEAVING') {
        setBossProgress(prev => {
          const next = prev - 0.08;
          if (next <= 0) {
            setBossState('AWAY');
            bossTimerRef.current = 4.0 + Math.random() * 4.0;
            return 0;
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(bossInterval);
  }, [gameMode, bossState, bossType, sunglassesTimer, gameOverCount, currentSkin, addFloatingText]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none flex flex-col justify-between">
      {/* ================= TOP HUD CLUSTERS ================= */}
      <header className="absolute top-0 inset-x-0 z-30 p-2 sm:p-4 flex items-center justify-between pointer-events-none">
        {/* Left: Day & Time & Boss Alert Radar */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border border-slate-700/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-lg backdrop-blur-xs flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
              DAY {day}
            </span>
            <div className="flex flex-col">
              <span className="text-white font-mono font-bold text-xs sm:text-sm tracking-wider">
                {formatTime(workdayMinutes)}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[100px] sm:max-w-none">
                {BOSS_PROFILES[bossType].name}
              </span>
            </div>
          </div>

          {/* 3 Lives Hearts */}
          <div className="bg-slate-900/90 border border-slate-700/80 px-2 sm:px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-xs flex items-center gap-1">
            {[1, 2, 3].map(heartIdx => (
              <Heart
                key={heartIdx}
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                  heartIdx <= lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-600 scale-90 opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center: Score & Combo */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-slate-900/90 border border-amber-500/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl shadow-xl backdrop-blur-xs flex items-center gap-1.5">
            <span className="text-amber-400 text-[10px] sm:text-xs font-mono">PTS</span>
            <span className="text-white font-mono font-extrabold text-sm sm:text-lg tabular-nums">
              {score}
            </span>
            {combo > 1 && (
              <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[10px] font-bold px-1 rounded font-mono animate-bounce">
                x{combo.toFixed(1)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            HI: {highScore}
          </span>
        </div>

        {/* Right: Coins, Sound & Shop */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto">
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-300 font-mono font-bold text-xs shadow-lg transition-all"
            title="Breakroom Shop"
          >
            <span>🪙</span>
            <span>{coins}</span>
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {gameMode === 'PLAYING' && (
            <button
              onClick={() => setGameMode('PAUSED')}
              className="p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Pause"
              aria-label="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN 60FPS CANVAS ================= */}
      <main className="relative flex-1 w-full h-full">
        <GameCanvas
          playerState={playerState}
          bossType={bossType}
          bossState={bossState}
          bossProgress={bossProgress}
          isWarning={isWarning}
          warningCountdown={warningCountdown}
          equippedSkin={currentSkin}
          bossSpeech={bossSpeech}
          colleagueSpeech={colleagueSpeech}
          workdayMinutes={workdayMinutes}
          funMeter={funMeter}
          combo={combo}
          floatingTexts={floatingTexts}
          sunglassesActive={sunglassesTimer > 0}
          coffeeActive={coffeeTimer > 0}
          cameraShake={cameraShake}
        />

        {/* Mobile Radar Ticker (Urgent Boss Proximity alert) */}
        {gameMode === 'PLAYING' && (
          <div className="absolute top-14 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
            {isWarning ? (
              <div className="bg-rose-600/95 border-2 border-white text-white px-3 py-1 rounded-full text-xs font-bold font-['Fredoka'] shadow-xl animate-pulse flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 fill-amber-300 text-rose-600" />
                <span>BOSS IS COMING! RELEASE IN {warningCountdown.toFixed(1)}s!</span>
              </div>
            ) : bossState === 'INSPECTING' ? (
              <div className="bg-rose-950/90 border border-rose-500 text-rose-300 px-3 py-1 rounded-full text-xs font-bold font-['Fredoka'] shadow-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>BOSS IS INSPECTING DESK! KEEP TYPING!</span>
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-slate-800 text-emerald-400 px-3 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>COAST IS CLEAR • HOLD TO SLACK</span>
              </div>
            )}
          </div>
        )}

        {/* Active Power-up Badges */}
        {gameMode === 'PLAYING' && (coffeeTimer > 0 || sunglassesTimer > 0) && (
          <div className="absolute top-24 left-3 z-20 flex flex-col gap-1 pointer-events-none">
            {coffeeTimer > 0 && (
              <div className="bg-amber-600/90 border border-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                <span>☕</span>
                <span>Turbo Coffee ({coffeeTimer}s)</span>
              </div>
            )}
            {sunglassesTimer > 0 && (
              <div className="bg-sky-600/90 border border-sky-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                <span>🕶️</span>
                <span>Incognito Mode ({sunglassesTimer}s)</span>
              </div>
            )}
          </div>
        )}

        {/* ================= ERGONOMIC MOBILE TOUCH CONTROLS ================= */}
        {gameMode === 'PLAYING' && (
          <div
            onPointerDown={handleStartSlack}
            onPointerUp={handleStopSlack}
            onPointerCancel={handleStopSlack}
            onContextMenu={e => e.preventDefault()}
            className="absolute inset-0 z-10 cursor-pointer touch-none flex flex-col justify-end items-center p-3 sm:p-4 pb-16 pointer-events-auto"
          >
            {/* The Big Ergonomic Slacking Button */}
            <div className="w-full max-w-sm flex flex-col items-center gap-2 select-none">
              <button
                type="button"
                className={`relative w-full h-16 sm:h-18 rounded-2xl border-4 overflow-hidden shadow-2xl transition-all duration-150 transform flex items-center justify-center gap-3 ${
                  isHoldingRef.current
                    ? 'bg-purple-700 border-purple-400 scale-98 shadow-purple-500/50'
                    : 'bg-gradient-to-r from-slate-900 to-slate-950 border-amber-500/60 hover:border-amber-400 active:scale-98 shadow-amber-500/20'
                }`}
              >
                {/* Liquid Fill Meter inside button */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-200 pointer-events-none opacity-30 ${
                    isSuperSlacker
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${funMeter}%` }}
                />

                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                      isHoldingRef.current ? 'bg-purple-500 text-white animate-spin' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {isHoldingRef.current ? '🎮' : '📱'}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-sm sm:text-base font-extrabold text-white font-['Fredoka'] tracking-wide">
                      {isHoldingRef.current
                        ? '🔥 SLACKING! (HOLDING)'
                        : 'PRESS & HOLD TO SLACK OFF'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {isHoldingRef.current
                        ? '⚠️ RELEASE BEFORE BOSS TURNS!'
                        : `FUN METER: ${Math.round(funMeter)}% • SCORE 25 PTS/S`}
                    </span>
                  </div>
                </div>
              </button>

              {/* Thumb-friendly Power-Up Hotbar */}
              <div
                className="w-full flex items-center justify-center gap-2 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {powerUps.map(item => (
                  <button
                    key={item.id}
                    onClick={() => usePowerUp(item.id)}
                    className={`flex-1 h-11 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold font-['Fredoka'] shadow-md transition-all active:scale-95 ${
                      item.owned > 0
                        ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/50 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-mono text-amber-400">x{item.owned}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TITLE SCREEN ================= */}
        {gameMode === 'TITLE' && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-y-auto">
            {/* Bespoke Title Lockup */}
            <div className="mb-3 transform hover:scale-102 transition-transform">
              <svg viewBox="0 0 460 110" className="w-72 sm:w-96 drop-shadow-2xl">
                <defs>
                  <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <rect x="10" y="8" width="440" height="94" rx="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" opacity="0.95" />
                <text x="230" y="52" textAnchor="middle" fill="url(#titleGrad)" fontFamily="Fredoka, sans-serif" fontWeight="800" fontSize="34">
                  BOSS ESCAPE
                </text>
                <text x="230" y="80" textAnchor="middle" fill="#38bdf8" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="15" letterSpacing="3">
                  ULTIMATE OFFICE MODE
                </text>
              </svg>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4 font-['Fredoka']">
              Frantically type when the boss audits your desk! Slack off, eat donuts, and scroll memes the instant their back is turned.
            </p>

            {/* Character & Skin Card */}
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl flex items-center justify-between w-full max-w-xs mb-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-lg shadow-inner"
                  style={{ backgroundColor: currentSkin.avatarColor }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentSkin.hairColor }} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white font-['Fredoka']">{currentSkin.name}</p>
                  <p className="text-[10px] text-amber-400">{currentSkin.specialPerk}</p>
                </div>
              </div>
              <button
                onClick={() => setIsShopOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Fredoka'] font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
              >
                Wardrobe
              </button>
            </div>

            {/* Start Button */}
            <button
              onClick={startShift}
              className="w-full max-w-xs py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-['Fredoka'] font-extrabold text-base sm:text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all mb-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CLOCK IN (START SHIFT)</span>
            </button>

            {/* How to play trigger button */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline font-['Fredoka']"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to Play</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setIsShopOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-['Fredoka']"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Breakroom Shop</span>
              </button>
            </div>

            {/* Control hints */}
            <p className="text-[10px] text-slate-500 font-mono">
              Desktop: Spacebar / Click · Mobile: Tap & Hold Screen
            </p>
          </div>
        )}

        {/* ================= HOW TO PLAY MODAL ================= */}
        {isHelpOpen && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-['Fredoka'] font-bold text-white text-base">Office Rules & Tactics</h3>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">💼</span>
                  <div>
                    <h4 className="font-bold text-white font-['Fredoka']">1. Typing Mode (Safe)</h4>
                    <p className="text-[11px] text-slate-400">By default you type furiously. When the boss inspects, you MUST be in this mode!</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">🎮</span>
                  <div>
                    <h4 className="font-bold text-white font-['Fredoka']">2. Slacking Mode (Risk & Coins)</h4>
                    <p className="text-[11px] text-slate-400">Hold Spacebar or Screen to slack off. Fills your Fun Meter and drops shiny coins!</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-white font-['Fredoka']">3. Boss Alert!</h4>
                    <p className="text-[11px] text-slate-400">When the '!' flashes, immediately release your finger before the boss turns around!</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-['Fredoka'] rounded-xl text-xs mt-1"
              >
                Got It, Let's Play!
              </button>
            </div>
          </div>
        )}

        {/* ================= PAUSE MODAL ================= */}
        {gameMode === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 text-center">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full shadow-2xl flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-white font-['Fredoka']">Shift Paused</h2>
              <p className="text-xs text-slate-400 font-sans">
                Taking a quick coffee break? Boss is waiting at your desk...
              </p>

              <button
                onClick={() => setGameMode('PLAYING')}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-['Fredoka'] text-sm shadow-md"
              >
                Resume Shift
              </button>
              <button
                onClick={() => setIsShopOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-['Fredoka'] text-sm"
              >
                Breakroom Shop
              </button>
              <button
                onClick={startShift}
                className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-['Fredoka'] text-xs"
              >
                Restart Day
              </button>
            </div>
          </div>
        )}

        {/* ================= VICTORY MODAL ================= */}
        {gameMode === 'VICTORY' && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs flex items-center justify-center p-6 text-center">
            <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl">
                🍻
              </div>
              <h2 className="text-2xl font-extrabold text-white font-['Fredoka']">
                5:00 PM! HAPPY HOUR!
              </h2>
              <p className="text-xs text-slate-300">
                You survived Day {day} without getting caught slacking! Overtime bonus delivered.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 w-full my-2 flex justify-around text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Score</span>
                  <span className="text-white font-bold text-base">{score}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Shift Bonus</span>
                  <span className="text-emerald-400 font-bold text-base">+150 🪙</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDay(d => d + 1);
                  startShift();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-['Fredoka'] shadow-lg"
              >
                Start Next Day (Day {day + 1})
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME OVER MODAL ================= */}
        {gameMode === 'GAMEOVER' && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 text-center">
            <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl animate-bounce">
                📦
              </div>
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">
                  TERMINATED BY MANAGEMENT
                </span>
                <h2 className="text-2xl font-extrabold text-white font-['Fredoka'] mt-0.5">
                  YOU'RE FIRED!
                </h2>
              </div>

              {/* Fired Reason Pink Slip */}
              <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-200 italic font-sans text-left w-full">
                "{firedReason}"
              </div>

              {/* Score Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 w-full grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">FINAL SCORE</span>
                  <span className="text-white font-bold text-base">{score}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">HIGH SCORE</span>
                  <span className="text-amber-400 font-bold text-base">{highScore}</span>
                </div>
              </div>

              {/* Watch Ad to Revive Button */}
              {!hasRevived ? (
                <button
                  onClick={() => setShowRewardedAd(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-['Fredoka'] text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform active:scale-98 transition-all"
                >
                  <Tv className="w-4 h-4" />
                  <span>WATCH AD TO REVIVE (+1 LIFE)</span>
                </button>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Ad revive already used for this shift!
                </p>
              )}

              {/* Restart Shift */}
              <button
                onClick={startShift}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-['Fredoka'] text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clock In Again (New Shift)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= FIXED BOTTOM ADMOB BANNER ================= */}
      <BannerAd />

      {/* ================= SHOP MODAL ================= */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        skins={skins}
        equippedSkinId={equippedSkinId}
        onEquipSkin={id => setEquippedSkinId(id)}
        onBuySkin={handleBuySkin}
        powerUps={powerUps}
        onBuyPowerUp={handleBuyPowerUp}
      />

      {/* ================= REWARDED AD MODAL ================= */}
      <RewardedAdModal
        isOpen={showRewardedAd}
        onRewardEarned={handleReviveFromAd}
        onClose={() => setShowRewardedAd(false)}
      />

      {/* ================= INTERSTITIAL AD MODAL ================= */}
      <InterstitialAdModal
        isOpen={showInterstitialAd}
        onClose={() => setShowInterstitialAd(false)}
      />
    </div>
  );
}
