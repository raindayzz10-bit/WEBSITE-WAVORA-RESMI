import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Waves } from 'lucide-react';
import { aquaticSoundEngine } from '../utils/aquaticSoundEngine';

interface AquaticAudioToggleProps {
  variant?: 'navbar' | 'floating' | 'compact';
  className?: string;
}

export const AquaticAudioToggle: React.FC<AquaticAudioToggleProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const unsubscribe = aquaticSoundEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    aquaticSoundEngine.toggle();
  };

  if (variant === 'compact') {
    return (
      <button
        id="aquatic-sound-toggle-compact"
        onClick={handleToggle}
        className={`relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
          isPlaying
            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/20'
            : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
        } ${className}`}
        title={isPlaying ? 'Matikan Suara Ambien Kolam Renang' : 'Dengarkan Ambien Air Tenang'}
        aria-label="Toggle Aquatic Sound Ambience"
      >
        {isPlaying ? (
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
            <span className="w-1 h-4.5 bg-cyan-300 rounded-full animate-[pulse_1.1s_ease-in-out_infinite]" />
            <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
          </div>
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        id="aquatic-sound-toggle-btn"
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`group relative px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
          isPlaying
            ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300 shadow-lg shadow-cyan-950/50'
            : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/60 hover:border-cyan-500/30 text-slate-400 hover:text-slate-200'
        } ${className}`}
        aria-label="Ambien Air Kolam Renang"
      >
        {isPlaying ? (
          <>
            {/* Visual sound equalizer bars */}
            <div className="flex items-center gap-0.5 h-3.5 px-0.5">
              <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3.5 bg-cyan-300 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
              <span className="w-0.5 h-2.5 bg-teal-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
              <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
            <span className="font-mono text-[11px] tracking-wide text-cyan-200">Ambien: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden xl:inline text-[11px] text-slate-400 group-hover:text-slate-200 font-medium">
              Ambien Air
            </span>
          </>
        )}
      </button>

      {/* Floating explanatory tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-[11px] text-cyan-200 shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none transition-all">
          <p className="flex items-center gap-1.5">
            <Waves className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>{isPlaying ? 'Klik untuk mute suara air tenang' : 'Klik untuk dengarkan suara deburan air tenang 🌊'}</span>
          </p>
        </div>
      )}
    </div>
  );
};
