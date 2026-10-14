import { useCallback, useEffect, useRef, useState } from 'react';
import type { TraceEvent } from '../services/api';
import { getNarration } from '../services/narrationService';

export type VoiceStatus = 'unsupported' | 'off' | 'ready' | 'speaking';

interface VoiceNarrationOptions {
  enabled: boolean;
  rate: number;
  volume: number;
  event: TraceEvent | null;
  algorithmId: string;
  algorithmName: string;
}

const speechIsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function useVoiceNarration({ enabled, rate, volume, event, algorithmId, algorithmName }: VoiceNarrationOptions) {
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

  useEffect(() => {
    if (!supported || !enabled || !event) {
      if (speechIsSupported()) window.speechSynthesis.cancel();
      setStatus(supported && enabled ? 'ready' : supported ? 'off' : 'unsupported');
      return;
    }

    const narration = getNarration(event, { algorithmId, algorithmName });
    const utterance = new SpeechSynthesisUtterance(narration.text);
    let active = true;
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.onstart = () => { if (active) setStatus('speaking'); };
    utterance.onend = () => { if (active) setStatus('ready'); };
    utterance.onerror = () => { if (active) setStatus('ready'); };

    // Cancel first so rapid step navigation can never create overlapping speech.
    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      active = false;
      window.speechSynthesis.cancel();
    };
  }, [algorithmId, algorithmName, enabled, event, rate, supported, volume]);

  return { supported, status, cancel };
}
