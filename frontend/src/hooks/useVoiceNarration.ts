import { useCallback, useEffect, useRef, useState } from 'react';
import type { TraceEvent } from '../services/api';
import { getNarration, type NarrationContext } from '../services/narrationService';

export type VoiceStatus = 'unsupported' | 'off' | 'ready' | 'speaking';

interface VoiceNarrationOptions {
  enabled: boolean;
  rate: number;
  volume: number;
}

const speechIsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function useVoiceNarration({ enabled, rate, volume }: VoiceNarrationOptions) {
  const [supported] = useState(speechIsSupported);
  const [status, setStatus] = useState<VoiceStatus>(() => supported ? 'off' : 'unsupported');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (speechIsSupported()) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus(supported ? (enabled ? 'ready' : 'off') : 'unsupported');
  }, [enabled, supported]);

  useEffect(() => () => {
    if (speechIsSupported()) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((event: TraceEvent, context: NarrationContext, onFinished?: () => void) => {
    if (!supported || !enabled) return () => undefined;

    const narration = getNarration(event, context);
    const utterance = new SpeechSynthesisUtterance(narration.text);
    let active = true;
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.onstart = () => { if (active) setStatus('speaking'); };
    utterance.onend = () => {
      if (!active) return;
      utteranceRef.current = null;
      setStatus('ready');
      onFinished?.();
    };
    utterance.onerror = () => { if (active) setStatus('ready'); };

    // Cancel first so rapid step navigation can never create overlapping speech.
    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      active = false;
      if (utteranceRef.current === utterance) window.speechSynthesis.cancel();
    };
  }, [enabled, rate, supported, volume]);

  useEffect(() => {
    if (!enabled) cancel();
  }, [cancel, enabled]);

  return { supported, status, cancel, speak };
}
