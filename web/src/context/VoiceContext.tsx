import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecognitionCtor, isVoiceSupported, speak, type SpeechRecognitionLike } from "../lib/speech";
import { matchesVoiceKeyword, voiceLangCode } from "../lib/translations";
import { useLanguage } from "./LanguageContext";

export const VOICE_COMMAND_EVENT = "kafeflow:voice-command";

interface VoiceContextValue {
  voiceEnabled: boolean;
  voiceSupported: boolean;
  toggleVoice: () => void;
  lastHeard: string;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

const STORAGE_KEY = "kafeflow_voice_enabled";
const MAX_CONSECUTIVE_ERRORS = 2;
const RESTART_DELAY_MS = 300;

function readInitialEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const voiceSupported = isVoiceSupported();
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => (voiceSupported ? readInitialEnabled() : false));
  const [lastHeard, setLastHeard] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const explicitStopRef = useRef(false);
  const errorCountRef = useRef(0);
  const permissionDeniedRef = useRef(false);

  const voiceEnabledRef = useRef(voiceEnabled);
  const languageRef = useRef(language);
  const navigateRef = useRef(navigate);
  const tRef = useRef(t);
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const disableVoice = useCallback((announce: boolean) => {
    explicitStopRef.current = true;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
    setVoiceEnabledState(false);
    try {
      localStorage.setItem(STORAGE_KEY, "0");
    } catch {
      // ignore
    }
    if (announce) {
      speak(tRef.current("voice.disabledError"), voiceLangCode(languageRef.current));
    }
  }, []);

  const handleGlobalCommand = useCallback((text: string) => {
    const lang = languageRef.current;
    if (matchesVoiceKeyword(text, lang, "back")) {
      navigateRef.current(-1);
      return;
    }
    if (matchesVoiceKeyword(text, lang, "menu")) {
      navigateRef.current("/menyu");
      return;
    }
  }, []);

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = voiceLangCode(languageRef.current);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      errorCountRef.current = 0;
      const text: string = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!text) return;
      setLastHeard(text);
      window.dispatchEvent(new CustomEvent(VOICE_COMMAND_EVENT, { detail: { text } }));
      handleGlobalCommand(text.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === "no-speech" || err === "aborted") return;
      if (err === "not-allowed" || err === "service-not-allowed") {
        permissionDeniedRef.current = true;
      }
      errorCountRef.current += 1;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (explicitStopRef.current) return;
      if (!voiceEnabledRef.current) return;

      if (permissionDeniedRef.current || errorCountRef.current > MAX_CONSECUTIVE_ERRORS) {
        disableVoice(true);
        return;
      }

      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (voiceEnabledRef.current && !explicitStopRef.current) {
          startRecognition();
        }
      }, RESTART_DELAY_MS);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // start() can throw if already started; ignore
    }
  }, [disableVoice, handleGlobalCommand]);

  const toggleVoice = useCallback(() => {
    if (!voiceSupported) return;
    if (voiceEnabledRef.current) {
      disableVoice(false);
      setLastHeard("");
      return;
    }

    errorCountRef.current = 0;
    permissionDeniedRef.current = false;
    explicitStopRef.current = false;
    setVoiceEnabledState(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    speak(tRef.current("voice.enabled"), voiceLangCode(languageRef.current));
    startRecognition();
  }, [voiceSupported, disableVoice, startRecognition]);

  // Resume listening on mount if it was left enabled (persisted across navigation/reload).
  useEffect(() => {
    if (voiceEnabledRef.current && voiceSupported) {
      explicitStopRef.current = false;
      startRecognition();
    }
    return () => {
      explicitStopRef.current = true;
      if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: VoiceContextValue = { voiceEnabled, voiceSupported, toggleVoice, lastHeard };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}
