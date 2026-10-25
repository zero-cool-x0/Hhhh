import React, { useState } from 'react';
import { Skin, PowerUpItem } from './types';
import { sounds } from './sound';
import { ShoppingBag, Sparkles, Check, Lock, X, Coffee, Shield } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  skins: Skin[];
  equippedSkinId: string;
  onEquipSkin: (skinId: string) => void;
  onBuySkin: (skin: Skin) => boolean;
  powerUps: PowerUpItem[];
  onBuyPowerUp: (item: PowerUpItem) => boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  skins,
  equippedSkinId,
  onEquipSkin,
  onBuySkin,
  powerUps,
  onBuyPowerUp
}) => {
  const [activeTab, setActiveTab] = useState<'SKINS' | 'ITEMS'>('SKINS');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold font-['Fredoka'] tracking-wide">Breakroom Office Shop</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full text-amber-300 font-bold font-mono text-sm border border-amber-400/30">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors"
              aria-label="Close shop"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div className="bg-amber-500 text-slate-950 font-bold text-center py-1.5 text-xs animate-bounce font-['Fredoka']">
            {feedbackMsg}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('SKINS')}
            className={`flex-1 py-2 rounded-xl font-['Fredoka'] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'SKINS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Worker Avatars ({skins.length})
          </button>
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`flex-1 py-2 rounded-xl font-['Fredoka'] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ITEMS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Power-Ups & Snacks
          </button>
        </div>

        {/* Tab content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
          {activeTab === 'SKINS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skins.map(skin => {
                const isEquipped = skin.id === equippedSkinId;
                return (
                  <div
                    key={skin.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40'
                        : skin.unlocked
                        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-950/70 border-slate-800 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Avatar preview dot and tags */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner relative"
                            style={{ backgroundColor: skin.avatarColor }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: skin.hairColor }}
                            />
                          </div>
                          <div>
                            <h4 className="font-['Fredoka'] font-bold text-white text-sm leading-tight">
                              {skin.name}
                            </h4>
                            <span className="text-[10px] text-amber-400 font-semibold">
                              {skin.accessory}
                            </span>
                          </div>
                        </div>

                        {skin.unlocked ? (
                          isEquipped ? (
                            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">
                              EQUIPPED
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-xs flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" />
                              Owned
                            </span>
                          )
                        ) : (
                          <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold">
                            <span>🪙</span>
                            <span>{skin.price}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-2 font-sans italic">
                        "{skin.tagline}"
                      </p>

                      <div className="text-[11px] text-indigo-300 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-900/50 mb-3 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{skin.specialPerk}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    {skin.unlocked ? (
                      <button
                        onClick={() => {
                          onEquipSkin(skin.id);
                          sounds.playCoin();
                          showFeedback(`Equipped ${skin.name}!`);
                        }}
                        disabled={isEquipped}
                        className={`w-full py-1.5 rounded-lg font-['Fredoka'] font-bold text-xs transition-all ${
                          isEquipped
                            ? 'bg-slate-700 text-slate-400 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isEquipped ? 'Currently Active' : 'Equip Skin'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const success = onBuySkin(skin);
                          if (success) {
                            showFeedback(`Unlocked ${skin.name}!`);
                          } else {
                            showFeedback('Not enough coins! Slack more to earn coins.');
                          }
                        }}
                        className={`w-full py-1.5 rounded-lg font-['Fredoka'] font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          coins >= skin.price
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-750'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock ({skin.price} 🪙)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {powerUps.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-['Fredoka'] font-bold text-white text-sm">
                          {item.name}
                        </h4>
                        <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                          In Stash: {item.owned}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                      {item.durationSec > 0 && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3" /> Duration: {item.durationSec}s
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const success = onBuyPowerUp(item);
                      if (success) {
                        showFeedback(`Purchased ${item.name}!`);
                      } else {
                        showFeedback('Not enough coins! Keep slacking to collect more.');
                      }
                    }}
                    className={`px-3 py-2 rounded-xl font-['Fredoka'] font-bold text-xs flex flex-col items-center justify-center shrink-0 min-w-20 transition-all ${
                      coins >= item.cost
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Buy</span>
                    <span className="font-mono text-[11px] font-bold">{item.cost} 🪙</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>💡 Tip: Hold screen to slack and spawn bonus coins!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-['Fredoka'] font-bold text-xs transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
