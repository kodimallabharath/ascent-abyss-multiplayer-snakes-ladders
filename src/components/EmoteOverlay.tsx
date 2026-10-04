import React, { useState } from 'react';
import { EmoteMessage } from '../types/game';
import { sound } from '../utils/audio';
import { Smile } from 'lucide-react';

interface EmoteOverlayProps {
  emotes: EmoteMessage[];
  onSendEmote: (emoji: string) => void;
  disabled?: boolean;
}

const EMOJIS = ['🎲', '🪜', '🐍', '🎉', '😱', '👏', '🔥', '👑'];

export const EmoteOverlay: React.FC<EmoteOverlayProps> = ({
  emotes,
  onSendEmote,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Animated Emotes Layer */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {emotes.map(emote => (
          <div
            key={emote.id}
            className="absolute bottom-20 flex flex-col items-center animate-bounce-up select-none"
            style={{
              left: `${(emote.timestamp % 70) + 15}%`,
            }}
          >
            <div className="text-3xl filter drop-shadow-lg transform hover:scale-125 transition-transform">
              {emote.emoji}
            </div>
            <span className="text-[10px] font-medium text-neutral-300 bg-neutral-950/80 px-1.5 py-0.5 rounded border border-neutral-800 shadow-xs whitespace-nowrap">
              {emote.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Emote Bar / Button */}
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-12 right-0 bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 backdrop-blur-md z-30">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                disabled={disabled}
                onClick={() => {
                  sound.playEmote();
                  onSendEmote(emoji);
                  setIsOpen(false);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-neutral-800 active:scale-90 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          disabled={disabled}
          className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Send Reaction Emote"
        >
          <Smile className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </>
  );
};
