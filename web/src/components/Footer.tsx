export function Footer() {
  return (
    <footer id="aloqa" className="border-t border-charcoal/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold">KafeFlow</p>
            <p className="mt-3 max-w-xs text-sm text-ivory/60">
              Kichik kafe uchun buyurtma, oshxona va toʻlovni bitta sodda tizimda boshqarish.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ivory/50">Aloqa</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory/70">
              <li>Toshkent, Chilonzor tumani</li>
              <li>+998 90 123 45 67</li>
              <li>hello@kafeflow.uz</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ivory/50">Ish vaqti</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory/70">
              <li>Har kuni: 08:00 – 23:00</li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-ivory/10 pt-6 text-xs text-ivory/40">
          © {new Date().getFullYear()} KafeFlow. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
