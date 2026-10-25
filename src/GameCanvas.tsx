import React, { useEffect, useRef } from 'react';
import { PlayerState, BossType, BossState, Skin, FloatingText, Particle } from './types';
import { BOSS_PROFILES, BossProfile } from './gameData';

interface GameCanvasProps {
  playerState: PlayerState;
  bossType: BossType;
  bossState: BossState;
  bossProgress: number; // 0 (away) to 1 (at desk)
  isWarning: boolean;
  warningCountdown: number;
  equippedSkin: Skin;
  bossSpeech: string | null;
  colleagueSpeech: string | null;
  workdayMinutes: number;
  funMeter: number;
  combo: number;
  floatingTexts: FloatingText[];
  sunglassesActive: boolean;
  coffeeActive: boolean;
  cameraShake: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerState,
  bossType,
  bossState,
  bossProgress,
  isWarning,
  warningCountdown,
  equippedSkin,
  bossSpeech,
  colleagueSpeech,
  workdayMinutes,
  funMeter,
  combo,
  floatingTexts,
  sunglassesActive,
  coffeeActive,
  cameraShake
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const blinkTimerRef = useRef<number>(0);
  const isBlinkingRef = useRef<boolean>(false);
  const handCycleRef = useRef<number>(0);

  const bossProfile: BossProfile = BOSS_PROFILES[bossType];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      // Eye blinking timer
      blinkTimerRef.current += dt;
      if (blinkTimerRef.current > 3.2) {
        isBlinkingRef.current = true;
        if (blinkTimerRef.current > 3.4) {
          isBlinkingRef.current = false;
          blinkTimerRef.current = 0;
        }
      }

      // Typing hand cycle
      handCycleRef.current += dt * (coffeeActive ? 24 : 14);

      // Canvas sizing & pixel ratio
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Camera Shake
      if (cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShake * 10;
        const shakeY = (Math.random() - 0.5) * cameraShake * 10;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Office Architecture & Windows
      drawDetailedOffice(ctx, width, height, workdayMinutes, time);

      // 2. Colleague Cubicle & Animated Coworker
      drawCoworkerCubicle(ctx, width, height, colleagueSpeech, time, isWarning);

      // 3. The Boss (Mr. Henderson, Karen HR, Lord BigBoss)
      drawExpressiveBoss(
        ctx,
        width,
        height,
        bossProfile,
        bossState,
        bossProgress,
        bossSpeech,
        isWarning,
        time
      );

      // 4. The Player Character & Desk Setup
      drawExpressivePlayer(
        ctx,
        width,
        height,
        playerState,
        equippedSkin,
        sunglassesActive,
        coffeeActive,
        funMeter,
        time,
        isBlinkingRef.current,
        handCycleRef.current
      );

      // 5. Screen Warning Edge Vignette & Overhead Warning Alert
      if (isWarning && bossState !== 'AWAY') {
        drawMobileWarningEffects(ctx, width, height, warningCountdown, time);
      }

      // 6. Particle Systems (typing papers, sparks, hearts, sweat drops)
      updateAndDrawParticles(ctx, particlesRef.current, playerState, width, height, dt, time);

      // 7. Floating score texts
      drawFloatingTexts(ctx, floatingTexts);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    playerState,
    bossType,
    bossState,
    bossProgress,
    isWarning,
    warningCountdown,
    equippedSkin,
    bossSpeech,
    colleagueSpeech,
    workdayMinutes,
    funMeter,
    combo,
    floatingTexts,
    sunglassesActive,
    coffeeActive,
    cameraShake,
    bossProfile
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

// ================= DRAWING FUNCTIONS =================

function drawDetailedOffice(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  workdayMinutes: number,
  time: number
) {
  // Back Wall with elegant corporate paneling
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
  wallGrad.addColorStop(0, '#0f172a');
  wallGrad.addColorStop(0.6, '#1e293b');
  wallGrad.addColorStop(1, '#111827');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h * 0.52);

  // Molded Chair-rail trim
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, h * 0.51, w, 6);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, h * 0.51 + 6, w, 2);

  // Carpet Flooring (Isometric Diamond Tile Texture)
  const floorGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
  floorGrad.addColorStop(0, '#1e293b');
  floorGrad.addColorStop(0.3, '#334155');
  floorGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  // Subtle Carpet Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const tileStep = Math.max(35, w * 0.08);
  for (let x = -w; x < w * 2; x += tileStep) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.52);
    ctx.lineTo(x + h * 0.6, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + h * 0.6, h * 0.52);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Skyline Window (Changes with daylight)
  const winW = Math.min(220, w * 0.38);
  const winH = Math.min(110, h * 0.24);
  const winX = w * 0.68;
  const winY = h * 0.06;

  // Window Frame
  ctx.fillStyle = '#090d16';
  drawRoundedRect(ctx, winX - 5, winY - 5, winW + 10, winH + 10, 8);
  ctx.fill();

  // Sky inside window
  const sky = ctx.createLinearGradient(0, winY, 0, winY + winH);
  if (workdayMinutes < 720) {
    // 9 AM - 12 PM: Bright Sky Blue
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(1, '#7dd3fc');
  } else if (workdayMinutes < 960) {
    // 12 PM - 4 PM: Sunny Warm Blue
    sky.addColorStop(0, '#0369a1');
    sky.addColorStop(1, '#bae6fd');
  } else {
    // 4 PM - 5 PM: Sunset Golden Hour
    sky.addColorStop(0, '#ea580c');
    sky.addColorStop(0.6, '#f97316');
    sky.addColorStop(1, '#fde047');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(winX, winY, winW, winH);

  // Cloud moving
  const cloudOffset = (time * 0.008) % (winW + 60) - 30;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(winX + cloudOffset, winY + 25, 12, 0, Math.PI * 2);
  ctx.arc(winX + cloudOffset + 14, winY + 22, 16, 0, Math.PI * 2);
  ctx.arc(winX + cloudOffset + 28, winY + 26, 12, 0, Math.PI * 2);
  ctx.fill();

  // City Silhouettes
  ctx.fillStyle = '#090d16';
  ctx.fillRect(winX + 15, winY + 45, 28, winH - 45);
  ctx.fillRect(winX + 48, winY + 25, 36, winH - 25);
  ctx.fillRect(winX + 88, winY + 52, 24, winH - 52);
  ctx.fillRect(winX + 116, winY + 35, 34, winH - 35);
  ctx.fillRect(winX + 155, winY + 60, 26, winH - 60);

  // Window mullions
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();

  // Motivational Office Poster on the Left
  const postX = w * 0.08;
  const postY = h * 0.08;
  const postW = Math.min(100, w * 0.22);
  const postH = 65;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, postX, postY, postW, postH, 4);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(postX + 4, postY + 4, postW - 8, postH - 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('10X SYNERGY', postX + postW / 2, postY + 20);
  ctx.fillStyle = '#0f172a';
  ctx.font = '6px Fredoka, sans-serif';
  ctx.fillText('GRIND NEVER SLEEPS', postX + postW / 2, postY + postH - 8);

  // Water Cooler (Center-Left)
  const coolerX = w * 0.38;
  const coolerY = h * 0.36;

  // Blue Jug
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(coolerX, coolerY - 18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(coolerX - 4, coolerY - 22, 4, 0, Math.PI * 2);
  ctx.fill();

  // Water cooler body
  ctx.fillStyle = '#e2e8f0';
  drawRoundedRect(ctx, coolerX - 12, coolerY - 4, 24, 42, 4);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(coolerX - 6, coolerY + 12, 12, 10);
  // Red & blue taps
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(coolerX - 4, coolerY + 14, 3, 4);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(coolerX + 1, coolerY + 14, 3, 4);
}

function drawCoworkerCubicle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colleagueSpeech: string | null,
  time: number,
  isWarning: boolean
) {
  const partX = 0;
  const partY = h * 0.38;
  const partW = w * 0.24;
  const partH = h * 0.36;

  // Gray Fabric Cubicle Wall
  ctx.fillStyle = '#475569';
  drawRoundedRect(ctx, partX, partY, partW, partH, 6);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Colleague Character behind wall
  const collX = partW * 0.65;
  const bob = isWarning ? Math.sin(time * 0.02) * 4 : Math.sin(time * 0.003) * 2;
  const collY = partY - 14 + bob;

  // Colleague Torso
  ctx.fillStyle = '#0284c7';
  drawRoundedRect(ctx, collX - 14, collY + 8, 28, 24, 6);
  ctx.fill();

  // Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(collX, collY, 13, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(collX, collY - 5, 13, Math.PI, 0, false);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(collX - 9, collY - 4, 8, 6);
  ctx.strokeRect(collX + 1, collY - 4, 8, 6);
  ctx.beginPath();
  ctx.moveTo(collX - 1, collY - 1);
  ctx.lineTo(collX + 1, collY - 1);
  ctx.stroke();

  // Eyes & Panic mouth if warning
  ctx.fillStyle = '#0f172a';
  if (isWarning) {
    // Panicked open mouth
    ctx.beginPath();
    ctx.arc(collX, collY + 6, 4, 0, Math.PI * 2);
    ctx.fill();
    // Sweat drop
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(collX + 14, collY - 6, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Calm smile
    ctx.beginPath();
    ctx.arc(collX, collY + 4, 4, 0, Math.PI, false);
    ctx.stroke();
  }

  // Colleague Urgent Speech Bubble
  if (colleagueSpeech) {
    const bubbleW = Math.min(190, w * 0.45);
    const bubbleX = Math.max(10, collX - 20);
    const bubbleY = Math.max(30, collY - 55);

    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, 34, 10);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(bubbleX + 30, bubbleY + 34);
    ctx.lineTo(collX, collY - 15);
    ctx.lineTo(bubbleX + 42, bubbleY + 34);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 9px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(colleagueSpeech, bubbleX + 8, bubbleY + 20, bubbleW - 16);
  }
}

function drawExpressiveBoss(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  boss: BossProfile,
  state: BossState,
  progress: number,
  speech: string | null,
  isWarning: boolean,
  time: number
) {
  if (state === 'AWAY') return;

  const startX = w + 90;
  const deskBossX = w * 0.66;
  const bossY = h * 0.46;

  let currentX = startX;
  if (state === 'APPROACHING') {
    currentX = startX - (startX - deskBossX) * progress;
  } else if (state === 'AT_DESK' || state === 'INSPECTING') {
    currentX = deskBossX;
  } else if (state === 'LEAVING') {
    currentX = deskBossX + (startX - deskBossX) * (1 - progress);
  }

  const isWalking = state === 'APPROACHING' || state === 'LEAVING';
  const walkBob = isWalking ? Math.sin(time * 0.014) * 6 : 0;
  const legCycle = isWalking ? Math.sin(time * 0.014) * 16 : 0;
  const headY = bossY + walkBob;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(currentX, bossY + 115, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Polished Trousers & Shoes
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  // Left leg
  ctx.beginPath();
  ctx.moveTo(currentX - 9, bossY + 70);
  ctx.lineTo(currentX - 9 - legCycle, bossY + 110);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(currentX + 9, bossY + 70);
  ctx.lineTo(currentX + 9 + legCycle, bossY + 110);
  ctx.stroke();

  // Shoes
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(currentX - 9 - legCycle - 2, bossY + 112, 6, 0, Math.PI * 2);
  ctx.arc(currentX + 9 + legCycle + 2, bossY + 112, 6, 0, Math.PI * 2);
  ctx.fill();

  // Tailored Suit Jacket
  ctx.fillStyle = boss.suitColor;
  drawRoundedRect(ctx, currentX - 22, headY + 22, 44, 52, 8);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // White Shirt Collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(currentX - 10, headY + 22);
  ctx.lineTo(currentX, headY + 38);
  ctx.lineTo(currentX + 10, headY + 22);
  ctx.fill();

  // Necktie swinging
  const tieSway = isWalking ? Math.sin(time * 0.014) * 4 : 0;
  ctx.fillStyle = boss.tieColor;
  ctx.beginPath();
  ctx.moveTo(currentX - 4, headY + 30);
  ctx.lineTo(currentX + 4, headY + 30);
  ctx.lineTo(currentX + 6 + tieSway, headY + 58);
  ctx.lineTo(currentX + tieSway, headY + 68);
  ctx.lineTo(currentX - 6 + tieSway, headY + 58);
  ctx.fill();

  // Boss Props by Type
  if (boss.type === 'MANAGER') {
    // Mr. Henderson holds a coffee mug: "BEST BOSS"
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, currentX - 32, headY + 44, 16, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (boss.type === 'HR') {
    // Karen holds audit clipboard with red pen
    ctx.fillStyle = '#991b1b';
    drawRoundedRect(ctx, currentX - 34, headY + 38, 18, 26, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(currentX - 31, headY + 42, 12, 18);
  } else {
    // CEO has gold Rolex and gold pen
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(currentX - 22, headY + 54, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(currentX, headY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Boss Hair & Features based on Boss Profile
  if (boss.type === 'MANAGER') {
    // Mr. Henderson: Balding sides with mustache & spectacles
    ctx.fillStyle = boss.hairColor;
    ctx.beginPath();
    ctx.arc(currentX - 14, headY - 6, 8, 0, Math.PI * 2);
    ctx.arc(currentX + 14, headY - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Bushy mustache
    ctx.fillStyle = '#334155';
    drawRoundedRect(ctx, currentX - 10, headY + 7, 20, 6, 3);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(currentX - 11, headY - 4, 9, 7);
    ctx.strokeRect(currentX + 2, headY - 4, 9, 7);
  } else if (boss.type === 'HR') {
    // Karen from HR: Sharp chestnut bob hairstyle & cat-eye glasses
    ctx.fillStyle = boss.hairColor;
    ctx.beginPath();
    ctx.arc(currentX, headY - 5, 22, Math.PI * 0.9, Math.PI * 2.1, false);
    ctx.lineTo(currentX + 22, headY + 12);
    ctx.lineTo(currentX + 14, headY + 18);
    ctx.lineTo(currentX - 14, headY + 18);
    ctx.lineTo(currentX - 22, headY + 12);
    ctx.fill();

    // Red cat-eye glasses
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(currentX - 12, headY - 3, 10, 6);
    ctx.strokeRect(currentX + 2, headY - 3, 10, 6);
  } else {
    // Lord BigBoss CEO: Slick silver pompadour & aviator sunglasses
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(currentX, headY - 14, 21, 10, 0, Math.PI, 0, false);
    ctx.fill();

    // Dark Aviator sunglasses
    ctx.fillStyle = '#090d16';
    drawRoundedRect(ctx, currentX - 13, headY - 4, 11, 8, 2);
    drawRoundedRect(ctx, currentX + 2, headY - 4, 11, 8, 2);
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Eyes and Glares
  const isInspecting = state === 'INSPECTING' || state === 'AT_DESK';
  if (boss.type !== 'CEO') {
    ctx.fillStyle = isInspecting ? '#dc2626' : '#0f172a';
    const pupilR = isInspecting ? 3.5 : 2.5;
    const lookOffset = isInspecting ? -4 : 3;
    ctx.beginPath();
    ctx.arc(currentX - 6 + lookOffset, headY - 1, pupilR, 0, Math.PI * 2);
    ctx.arc(currentX + 7 + lookOffset, headY - 1, pupilR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Laser glare beams if inspecting
  if (state === 'INSPECTING') {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(currentX - 6, headY - 1);
    ctx.lineTo(w * 0.44, h * 0.62);
    ctx.moveTo(currentX + 6, headY - 1);
    ctx.lineTo(w * 0.44, h * 0.62);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Boss Comic Speech Bubble
  if (speech) {
    const bubbleW = Math.min(220, w * 0.52);
    const bubbleX = Math.min(w - bubbleW - 12, Math.max(10, currentX - bubbleW * 0.5));
    const bubbleY = Math.max(20, headY - 65);

    ctx.fillStyle = '#fee2e2';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, 40, 12);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(currentX - 6, bubbleY + 40);
    ctx.lineTo(currentX, headY - 20);
    ctx.lineTo(currentX + 6, bubbleY + 40);
    ctx.fillStyle = '#fee2e2';
    ctx.fill();

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 10px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(speech, bubbleX + 10, bubbleY + 18, bubbleW - 20);
    ctx.fillStyle = '#b91c1c';
    ctx.font = '8px Fredoka, sans-serif';
    ctx.fillText(`— ${boss.name} (${boss.title})`, bubbleX + 10, bubbleY + 32);
  }
}

function drawExpressivePlayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  playerState: PlayerState,
  skin: Skin,
  sunglassesActive: boolean,
  coffeeActive: boolean,
  funMeter: number,
  time: number,
  isBlinking: boolean,
  handCycle: number
) {
  const deskX = w * 0.36;
  const deskY = h * 0.64;
  const deskW = Math.min(240, w * 0.58);
  const deskH = 85;

  // Desk Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(deskX + deskW * 0.45, deskY + deskH + 18, deskW * 0.55, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ergonomic Mesh Office Chair
  const chairX = deskX + deskW * 0.48;
  const chairY = deskY + 45;
  const chairRecline = playerState === 'SLACKING' ? 8 : 0;
  const chairTilt = playerState === 'BUSTED' ? -12 : 0;

  ctx.save();
  ctx.translate(chairX, chairY);
  ctx.rotate((chairTilt * Math.PI) / 180);

  // Chair Backrest
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, -26 - chairRecline, -34, 52, 60, 10);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 1. Worker Body Torso
  ctx.fillStyle = skin.shirtColor;
  drawRoundedRect(ctx, -20 - chairRecline, -12, 40, 46, 8);
  ctx.fill();

  // Neck
  ctx.fillStyle = skin.avatarColor;
  ctx.fillRect(-7 - chairRecline, -20, 14, 10);

  // Head
  const headX = -chairRecline;
  const headY = -34;
  ctx.fillStyle = skin.avatarColor;
  ctx.beginPath();
  ctx.arc(headX, headY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = skin.hairColor;
  ctx.beginPath();
  ctx.arc(headX, headY - 6, 21, Math.PI, 0, false);
  ctx.fill();

  // Skin Specific Gear
  if (skin.id === 'sleepy_panda') {
    // Panda ears
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headX - 16, headY - 18, 7, 0, Math.PI * 2);
    ctx.arc(headX + 16, headY - 18, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.id === 'nerd_coder') {
    // RGB Gaming Headset
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(headX, headY - 4, 23, Math.PI, 0, false);
    ctx.stroke();
    ctx.fillStyle = '#ec4899';
    drawRoundedRect(ctx, headX - 25, headY - 10, 8, 16, 4);
    drawRoundedRect(ctx, headX + 17, headY - 10, 8, 16, 4);
    ctx.fill();
  }

  // Facial Expression (Eyes, Mouth, Sweat)
  if (sunglassesActive || skin.id === 'pro_slacker') {
    // Cool Shades
    ctx.fillStyle = '#090d16';
    drawRoundedRect(ctx, headX - 15, headY - 5, 14, 9, 2);
    drawRoundedRect(ctx, headX + 1, headY - 5, 14, 9, 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Glare shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(headX - 12, headY - 3, 3, 5);
    ctx.fillRect(headX + 4, headY - 3, 3, 5);
  } else if (playerState === 'BUSTED') {
    // Terrified Shock Eyes O_O
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX - 7, headY - 3, 7, 0, Math.PI * 2);
    ctx.arc(headX + 7, headY - 3, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(headX - 7, headY - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + 7, headY - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Panic open mouth
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 8, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sweat waterfall
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(headX + 24, headY - 15, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (isBlinking) {
    // Blinking eye slits
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX - 11, headY - 2);
    ctx.lineTo(headX - 3, headY - 2);
    ctx.moveTo(headX + 3, headY - 2);
    ctx.lineTo(headX + 11, headY - 2);
    ctx.stroke();
  } else {
    // Normal / Slacking Eyes
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(headX - 7, headY - 3, 3.5, 0, Math.PI * 2);
    ctx.arc(headX + 7, headY - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (playerState === 'SLACKING') {
      // Cheeky smug smile :3
      ctx.arc(headX, headY + 5, 5, 0, Math.PI, false);
    } else {
      // Focused determined line
      ctx.moveTo(headX - 5, headY + 6);
      ctx.lineTo(headX + 5, headY + 6);
    }
    ctx.stroke();
  }

  ctx.restore();

  // 2. Wooden Desk Surface
  const deskGrad = ctx.createLinearGradient(deskX, deskY, deskX, deskY + deskH);
  deskGrad.addColorStop(0, '#d97706');
  deskGrad.addColorStop(0.3, '#b45309');
  deskGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = deskGrad;
  drawRoundedRect(ctx, deskX - deskW * 0.15, deskY, deskW * 1.15, deskH, 14);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Desk specular highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(deskX - deskW * 0.12, deskY + 4);
  ctx.lineTo(deskX + deskW * 0.96, deskY + 4);
  ctx.stroke();

  // 3. Computer Monitor
  const monX = deskX + deskW * 0.28;
  const monY = deskY - 65;
  const monW = Math.min(110, deskW * 0.5);
  const monH = 70;

  // Stand
  ctx.fillStyle = '#64748b';
  ctx.fillRect(monX + monW * 0.42, monY + monH, monW * 0.16, 20);
  ctx.fillRect(monX + monW * 0.22, monY + monH + 16, monW * 0.56, 6);

  // Monitor frame
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, monX, monY, monW, monH, 8);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Monitor Screen Display
  const scrX = monX + 4;
  const scrY = monY + 4;
  const scrW = monW - 8;
  const scrH = monH - 8;

  if (playerState === 'TYPING') {
    // Serious Work Mode: Code & Spreadsheet
    ctx.fillStyle = '#090d16';
    ctx.fillRect(scrX, scrY, scrW, scrH);

    // Syntax highlighted code lines
    ctx.fillStyle = '#38bdf8';
    ctx.font = '6px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('import { KPI } from "work";', scrX + 4, scrY + 12);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('const crunch = () => {', scrX + 4, scrY + 22);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('  excel.processAll();', scrX + 4, scrY + 32);
    ctx.fillStyle = '#ec4899';
    ctx.fillText('  return 100_000;', scrX + 4, scrY + 42);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('};', scrX + 4, scrY + 52);

    // Blinking cursor
    if (Math.floor(time / 200) % 2 === 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(scrX + 18, scrY + 50, 4, 6);
    }
  } else if (playerState === 'SLACKING') {
    // Secret Slacking Mode: TikTok / Cat Video / Arcade Game
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(scrX, scrY, scrW, scrH);

    // Cute animated cat jumping with rainbow trail
    const jump = Math.abs(Math.sin(time * 0.016)) * 12;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(scrX + scrW * 0.5, scrY + scrH * 0.65 - jump, 9, 0, Math.PI * 2);
    ctx.fill();
    // Cat ears
    ctx.beginPath();
    ctx.moveTo(scrX + scrW * 0.5 - 8, scrY + scrH * 0.65 - jump - 5);
    ctx.lineTo(scrX + scrW * 0.5 - 2, scrY + scrH * 0.65 - jump - 15);
    ctx.lineTo(scrX + scrW * 0.5, scrY + scrH * 0.65 - jump - 7);
    ctx.lineTo(scrX + scrW * 0.5 + 2, scrY + scrH * 0.65 - jump - 15);
    ctx.lineTo(scrX + scrW * 0.5 + 8, scrY + scrH * 0.65 - jump - 5);
    ctx.fill();

    // Hearts floating
    ctx.fillStyle = '#f43f5e';
    ctx.font = '10px serif';
    ctx.fillText('❤️', scrX + scrW * 0.75, scrY + 28 - (time * 0.02 % 20));
  } else {
    // BUSTED RED ALERT SCREEN
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(scrX, scrY, scrW, scrH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 BUSTED!', scrX + scrW / 2, scrY + scrH / 2 + 4);
  }

  // 4. Keyboard & Animated Hands
  const kbX = monX + monW * 0.08;
  const kbY = deskY + 12;
  const kbW = monW * 0.84;
  const kbH = 18;

  ctx.fillStyle = skin.id === 'nerd_coder' ? '#4f46e5' : '#1e293b';
  drawRoundedRect(ctx, kbX, kbY, kbW, kbH, 3);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();

  // Animated Keycaps
  const keyColors = skin.id === 'nerd_coder' ? ['#06b6d4', '#ec4899', '#a855f7', '#22c55e'] : ['#475569'];
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = keyColors[k % keyColors.length];
    ctx.fillRect(kbX + 4 + k * (kbW / 7), kbY + 3, kbW / 9, kbH - 6);
  }

  // Arms and Hands Animations
  const leftHandAlt = Math.sin(handCycle) * 6;
  const rightHandAlt = -Math.sin(handCycle) * 6;

  if (playerState === 'TYPING') {
    // Fast animated typing arms
    ctx.strokeStyle = skin.shirtColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Left arm
    ctx.beginPath();
    ctx.moveTo(chairX - 16, chairY + 8);
    ctx.lineTo(chairX - 22, chairY + 18 + leftHandAlt);
    ctx.lineTo(kbX + 16, kbY + 6);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(chairX + 16, chairY + 8);
    ctx.lineTo(chairX + 22, chairY + 18 + rightHandAlt);
    ctx.lineTo(kbX + kbW - 16, kbY + 6);
    ctx.stroke();

    // Hands
    ctx.fillStyle = skin.avatarColor;
    ctx.beginPath();
    ctx.arc(kbX + 16, kbY + 6, 5, 0, Math.PI * 2);
    ctx.arc(kbX + kbW - 16, kbY + 6, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (playerState === 'SLACKING') {
    // Holding glowing smartphone
    ctx.strokeStyle = skin.shirtColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(chairX - 16, chairY + 8);
    ctx.lineTo(chairX - 10, chairY + 20);
    ctx.lineTo(chairX - 4, chairY + 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chairX + 16, chairY + 8);
    ctx.lineTo(chairX + 10, chairY + 20);
    ctx.lineTo(chairX + 4, chairY + 16);
    ctx.stroke();

    // Smartphone
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, chairX - 10, chairY + 6, 20, 26, 4);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(chairX - 8, chairY + 9, 16, 20);

    // Hands holding phone
    ctx.fillStyle = skin.avatarColor;
    ctx.beginPath();
    ctx.arc(chairX - 8, chairY + 20, 5, 0, Math.PI * 2);
    ctx.arc(chairX + 8, chairY + 20, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Busted: hands thrown up in air
    ctx.strokeStyle = skin.shirtColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(chairX - 16, chairY + 8);
    ctx.lineTo(chairX - 26, chairY - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(chairX + 16, chairY + 8);
    ctx.lineTo(chairX + 26, chairY - 14);
    ctx.stroke();

    ctx.fillStyle = skin.avatarColor;
    ctx.beginPath();
    ctx.arc(chairX - 26, chairY - 14, 5, 0, Math.PI * 2);
    ctx.arc(chairX + 26, chairY - 14, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Coffee Mug with Steam
  const mugX = deskX - 12;
  const mugY = deskY + 10;
  ctx.fillStyle = coffeeActive ? '#ea580c' : '#f8fafc';
  drawRoundedRect(ctx, mugX, mugY, 18, 20, 4);
  ctx.fill();
  ctx.strokeStyle = coffeeActive ? '#f97316' : '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mugX - 2, mugY + 10, 6, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.stroke();

  // Steam
  const steamY = mugY - 10 - Math.sin(time * 0.005) * 6;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(mugX + 9 + Math.cos(time * 0.006) * 3, steamY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMobileWarningEffects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  countdown: number,
  time: number
) {
  // 1. Screen Edge Flashing Red Vignette
  const pulse = Math.abs(Math.sin(time * 0.015));
  ctx.save();
  ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.5})`;
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.restore();

  // 2. Center Overhead Exclamation Badge
  const alertX = w * 0.52;
  const alertY = h * 0.28;
  const scale = 1 + Math.sin(time * 0.02) * 0.15;

  ctx.save();
  ctx.translate(alertX, alertY);
  ctx.scale(scale, scale);

  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 42);
  glow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
  glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();

  // Badge
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Exclamation '!'
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 0, -1);

  // Countdown badge
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px Fredoka, sans-serif';
  ctx.fillText(`${countdown.toFixed(1)}s`, 0, 32);

  ctx.restore();
}

function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  playerState: PlayerState,
  w: number,
  h: number,
  dt: number,
  time: number
) {
  if (playerState === 'TYPING' && Math.random() < 0.3) {
    particles.push({
      x: w * 0.5 + (Math.random() - 0.5) * 36,
      y: h * 0.66,
      vx: (Math.random() - 0.5) * 70,
      vy: -Math.random() * 90 - 40,
      color: Math.random() > 0.5 ? '#ffffff' : '#22c55e',
      size: Math.random() * 4 + 2,
      life: 0.8,
      maxLife: 0.8
    });
  } else if (playerState === 'SLACKING' && Math.random() < 0.4) {
    particles.push({
      x: w * 0.52 + (Math.random() - 0.5) * 44,
      y: h * 0.64,
      vx: (Math.random() - 0.5) * 90,
      vy: -Math.random() * 100 - 50,
      color: ['#f43f5e', '#ec4899', '#a855f7', '#fde047', '#38bdf8'][Math.floor(Math.random() * 5)],
      size: Math.random() * 6 + 3,
      life: 0.9,
      maxLife: 0.9
    });
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach(item => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, item.alpha);
    ctx.fillStyle = item.color;
    ctx.font = 'bold 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 5;
    ctx.fillText(item.text, item.x, item.y);
    ctx.restore();
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
