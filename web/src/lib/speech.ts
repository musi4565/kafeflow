// Thin wrapper around the Web Speech API. Gracefully degrades when unsupported.

export type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
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

export function speak(text: string, lang: string = "uz-UZ") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const baseLang = lang.split("-")[0]?.toLowerCase();
    const matchingVoice =
      voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(baseLang));
    if (matchingVoice) utter.voice = matchingVoice;
    utter.lang = matchingVoice ? matchingVoice.lang : lang;
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore
  }
}
