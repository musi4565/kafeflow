// Thin wrapper around the Web Speech API. Gracefully degrades when unsupported.

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported(): boolean {
  if (typeof window === "undefined") return false;
  const hasRecognition = !!getRecognitionCtor();
  const hasSynthesis = "speechSynthesis" in window;
  return hasRecognition && hasSynthesis;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("uz"));
    if (uzVoice) utter.voice = uzVoice;
    utter.lang = uzVoice ? uzVoice.lang : "uz-UZ";
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore
  }
}

export function listenOnce(onCommand: (text: string) => void, onError?: () => void): (() => void) | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "uz-UZ";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    onCommand(text.trim().toLowerCase());
  };
  recognition.onerror = () => {
    onError?.();
  };

  recognition.start();
  return () => recognition.stop();
}
