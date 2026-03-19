'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, Volume2, MessageSquare, UserPlus, Video } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  driverName: string;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, phoneNumber, driverName }) => {
  const [status, setStatus] = useState<"ringing" | "connected">("ringing");
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  // Audio Context Ref for ringing sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Generate avatar seed from name
  const avatarSeed = driverName.replace(/\s+/g, "");

  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Reset state when opened
    setStatus("ringing");
    setSeconds(0);
    setIsMuted(false);
    setIsSpeaker(false);

    // Ringing Sound Effect (US Standard Ring: 440Hz + 480Hz, 2s ON, 4s OFF)
    if (status === "ringing") {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;

          const playRing = () => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.frequency.setValueAtTime(440, ctx.currentTime);
            osc2.frequency.setValueAtTime(480, ctx.currentTime);

            // Fade in/out to avoid clicking
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime + 1.8);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);

            osc1.stop(ctx.currentTime + 2.0);
            osc2.stop(ctx.currentTime + 2.0);

            oscillatorsRef.current = [osc1, osc2];
          };

          // Play immediately
          playRing();

          // Loop every 6 seconds (2s ring + 4s silence)
          const interval = setInterval(playRing, 6000);

          // Simulate connection after random time (3-6s)
          const connectTimeout = setTimeout(() => {
            setStatus("connected");
            clearInterval(interval);
            if (audioCtxRef.current) {
              audioCtxRef.current.close();
            }
          }, 3000 + Math.random() * 2000);

          return () => {
            clearInterval(interval);
            clearTimeout(connectTimeout);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
              audioCtxRef.current.close();
            }
          };
        }
      } catch (e) {
        console.error("Audio Playback Error", e);
      }
    }

    return () => {
      document.body.style.overflow = 'auto';
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [isOpen, status]);

  // Timer when connected
  useEffect(() => {
    if (status === "connected") {
      const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    // Just close the modal - no external redirect, all in-app
    onClose();
  };

  const ActionButton = ({
    icon,
    label,
    active,
    onPress,
    disabled
  }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onPress?: () => void;
    disabled?: boolean;
  }) => (
    <div className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <button
        onClick={onPress}
        disabled={disabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          active
            ? "bg-white text-gray-900"
            : "bg-[#ffffff20] backdrop-blur-md text-white border border-white/10"
        } ${!disabled && "active:scale-95"}`}
      >
        {icon}
      </button>
      <span className="text-[13px] text-white/80 font-medium tracking-wide">{label}</span>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1c2c3e] z-[9999] overflow-hidden">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
          className="w-full h-full object-cover opacity-30 blur-3xl scale-125"
          alt="blur-bg"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center">
        {/* Top Spacer */}
        <div className="flex-1 max-h-[15%]" />

        {/* Avatar & Status */}
        <div className="flex flex-col items-center gap-6 mb-8 animate-in fade-in zoom-in duration-700">
          <div className="relative">
            {/* Ripple Effect when Ringing */}
            {status === "ringing" && (
              <>
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-[-10px] rounded-full border border-white/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </>
            )}

            <div className="w-32 h-32 rounded-full border-[3px] border-white/20 shadow-2xl overflow-hidden bg-white">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt={driverName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-[32px] font-bold text-white tracking-tight drop-shadow-md">
              {driverName}
            </h1>
            <p className="text-[17px] text-white/70 font-medium tracking-wide">
              {status === "ringing" ? "Calling..." : formatTime(seconds)}
            </p>
            {status === "connected" && (
              <p className="text-[14px] text-white/60">{phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Middle Spacer */}
        <div className="flex-1" />

        {/* Action Grid */}
        <div className="w-full px-8 pb-10 space-y-6">
          {/* Row 1 */}
          <div className="flex justify-between items-center px-4">
            <ActionButton
              icon={<Mic className={`w-7 h-7 ${isMuted ? "text-[#FF3B30]" : ""}`} />}
              label="Mute"
              active={isMuted}
              onPress={() => setIsMuted(!isMuted)}
            />
            <ActionButton
              icon={<Volume2 className="w-7 h-7" />}
              label="Keypad"
              onPress={() => {}}
            />
            <ActionButton
              icon={<Volume2 className="w-7 h-7" />}
              label="Audio"
              active={isSpeaker}
              onPress={() => setIsSpeaker(!isSpeaker)}
            />
          </div>

          {/* Row 2 */}
          <div className="flex justify-between items-center px-4">
            <ActionButton
              icon={<UserPlus className="w-7 h-7" />}
              label="Add call"
            />
            <ActionButton
              icon={<Video className="w-7 h-7" />}
              label="FaceTime"
            />
            <ActionButton
              icon={<MessageSquare className="w-7 h-7" />}
              label="Contacts"
            />
          </div>

          {/* End Call Button */}
          <div className="pt-8 pb-8 flex justify-center">
            <button
              onClick={handleEndCall}
              className="w-20 h-20 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-transform hover:bg-red-600"
            >
              <Phone className="w-9 h-9 text-white fill-current rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;