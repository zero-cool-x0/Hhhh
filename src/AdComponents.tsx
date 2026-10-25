import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, X, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { sounds } from './sound';

// ---------------- Fixed Bottom Banner Ad ----------------
interface BannerAdProps {
  className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ className = '' }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`w-full z-40 transition-all duration-300 ${className}`}>
      {isMinimized ? (
        <div className="flex justify-center pb-1">
          <button
            onClick={() => setIsMinimized(false)}
            className="bg-slate-900/90 border border-slate-700/80 px-3 py-0.5 rounded-t-lg text-[10px] text-slate-400 hover:text-white flex items-center gap-1 shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Show AdMob Test Banner
          </button>
        </div>
      ) : (
        <div className="relative mx-auto max-w-md w-full bg-slate-900/95 border-t border-slate-700/80 p-1.5 shadow-2xl flex flex-col items-center">
          {/* Top Banner Tag */}
          <div className="w-full flex items-center justify-between px-2 text-[9px] text-slate-500 font-mono">
            <div className="flex items-center gap-1">
              <span className="bg-amber-400 text-slate-950 font-bold px-1 rounded-[2px] leading-tight">
                Ad
              </span>
              <span>Google AdMob Test (320x50)</span>
            </div>
            <div className="flex items-center gap-2">
              <span title="AdChoices" className="text-slate-400 flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z" />
                </svg>
                Choices
              </span>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Hide Banner"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Banner Creative Mockup */}
          <div className="w-full h-12 bg-gradient-to-r from-blue-900/40 via-indigo-900/50 to-purple-900/40 rounded border border-indigo-500/20 px-3 flex items-center justify-between gap-2 overflow-hidden mt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                ☕
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate font-['Fredoka']">
                  Office Hero: Cloud VPN Pro
                </p>
                <p className="text-[9px] text-indigo-300 truncate">
                  Slack securely with zero boss tracking • Install free
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                alert('AdMob Banner Test Click: ca-app-pub-3940256099942544/6300978111');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm shrink-0 font-['Fredoka']"
            >
              INSTALL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- Rewarded Video Ad Modal for Revive ----------------
interface RewardedAdModalProps {
  isOpen: boolean;
  onRewardEarned: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onRewardEarned,
  onClose
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          sounds.playRevive();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* AdMob Rewarded Header */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
              Ad
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AdMob Rewarded Video (Test Unit)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="text-xs font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                Reward in: {countdown}s
              </span>
            ) : (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Video Simulation Canvas / Creative */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated background rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-48 h-48 border-4 border-emerald-500 rounded-full animate-ping"></div>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl mb-3">
            {isCompleted ? (
              <CheckCircle2 className="w-10 h-10 text-slate-950 animate-bounce" />
            ) : (
              <Play className="w-8 h-8 fill-current text-slate-950 ml-1 animate-pulse" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white font-['Fredoka'] mb-1">
            {isCompleted ? '🎉 Extra Life Granted!' : 'Corporate Ergonomic Chair 3000'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xs font-sans">
            {isCompleted
              ? 'You survived getting fired! Jump right back into your high score run.'
              : 'End lumbar pain while slacking. Built with titanium hydraulics & snack tray.'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
            <div
              className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
          {isCompleted ? (
            <button
              onClick={() => {
                onRewardEarned();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-['Fredoka'] text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Claim +1 Life & Continue Playing!
            </button>
          ) : (
            <div className="text-center text-xs text-slate-400 font-mono py-1 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Watching sponsor video... Please wait ({countdown}s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- Interstitial Ad Modal (Triggers every 3rd Game Over) ----------------
interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ isOpen, onClose }) => {
  const [canSkipIn, setCanSkipIn] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCanSkipIn(3);
      return;
    }

    const interval = setInterval(() => {
      setCanSkipIn(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6">
        {/* Top Header with Skip/Close timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px]">
              Ad
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AdMob Interstitial (ca-app-pub-3940256099942544/1033173712)
            </span>
          </div>

          {canSkipIn > 0 ? (
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              Skip in {canSkipIn}s
            </span>
          ) : (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded-full border border-slate-600 transition-colors"
              aria-label="Close interstitial"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Ad Content Creative */}
        <div className="my-auto text-center space-y-4 py-4">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-2xl shadow-orange-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
              ☕⚡
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest font-mono">
              Exclusive Developer Deal
            </span>
            <h2 className="text-2xl font-bold text-white font-['Fredoka'] mt-1">
              Never Spill Your Coffee Again!
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-xs mx-auto">
              Smart Gyroscopic Self-Balancing Desk Mug. Survives sudden desk slams from angry bosses!
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 max-w-xs mx-auto flex items-center justify-around text-xs">
            <div className="text-center">
              <div className="text-amber-400 font-bold">100%</div>
              <div className="text-slate-400 text-[10px]">Spill-Proof</div>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-center">
              <div className="text-emerald-400 font-bold">12 Hrs</div>
              <div className="text-slate-400 text-[10px]">Piping Hot</div>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-center">
              <div className="text-indigo-400 font-bold">Boss-Proof</div>
              <div className="text-slate-400 text-[10px]">Titanium</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          <button
            onClick={() => {
              alert('AdMob Interstitial Conversion Test: Smart Mug Order Page Opened!');
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-['Fredoka'] text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>Learn More & Save 50%</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {canSkipIn === 0 && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white py-1 underline font-mono"
            >
              Continue to Game Over Screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
