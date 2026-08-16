import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Mic, MicOff, X } from "lucide-react";
import { isVoiceSupported } from "../lib/speech";

interface PublicHeaderProps {
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  showVoiceToggle?: boolean;
}

export function PublicHeader({ voiceEnabled, onToggleVoice, showVoiceToggle }: PublicHeaderProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const voiceSupported = isVoiceSupported();

  const links = [
    { label: "Menyu", href: "/menyu" },
    { label: "Biz haqimizda", href: "/#biz-haqimizda" },
    { label: "Buyurtma", href: "/#qanday-ishlaydi" },
    { label: "Aloqa", href: "/#aloqa" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="focus-ring rounded font-display text-2xl font-semibold tracking-tight">
          KafeFlow
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Asosiy navigatsiya">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="focus-ring rounded text-sm font-medium text-charcoal/80 transition hover:text-charcoal"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {showVoiceToggle && voiceSupported && (
            <button
              onClick={onToggleVoice}
              className="focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-3 py-2 text-xs font-medium text-charcoal/80 transition hover:bg-charcoal hover:text-ivory"
              aria-pressed={voiceEnabled}
              aria-label={voiceEnabled ? "Ovozli rejimni oʻchirish" : "Ovozli rejimni yoqish"}
            >
              {voiceEnabled ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
              Ovozli rejim
            </button>
          )}
          <button
            onClick={() => navigate("/menyu")}
            className="focus-ring rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-moss"
          >
            Buyurtma berish
          </button>
        </div>

        <button
          className="focus-ring rounded p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-charcoal/10 bg-ivory px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobil navigatsiya">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded text-sm font-medium text-charcoal/80"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/menyu");
              }}
              className="focus-ring mt-2 w-full rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-ivory"
            >
              Buyurtma berish
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
