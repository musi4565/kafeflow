import { Mic, MicOff } from "lucide-react";
import { useVoice } from "../context/VoiceContext";
import { useLanguage } from "../context/LanguageContext";

interface VoiceToggleButtonProps {
  className?: string;
  compact?: boolean;
}

export function VoiceToggleButton({ className = "", compact }: VoiceToggleButtonProps) {
  const { voiceEnabled, voiceSupported, toggleVoice } = useVoice();
  const { t } = useLanguage();

  if (!voiceSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleVoice}
      className={`focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-3 py-2 text-xs font-medium text-charcoal/80 transition hover:bg-charcoal hover:text-ivory ${className}`}
      aria-pressed={voiceEnabled}
      aria-label={voiceEnabled ? t("header.voice.disable") : t("header.voice.enable")}
    >
      {voiceEnabled ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
      {!compact && t("header.voice.label")}
    </button>
  );
}
