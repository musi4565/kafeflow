import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Coffee, QrCode, Sparkles } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { Footer } from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  const { t } = useLanguage();

  const previewItems = [
    {
      name: t("landing.preview.item1.name"),
      price: t("landing.preview.item1.price"),
      img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: t("landing.preview.item2.name"),
      price: t("landing.preview.item2.price"),
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: t("landing.preview.item3.name"),
      price: t("landing.preview.item3.price"),
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    },
  ];

  const steps = [
    {
      num: "01",
      title: t("landing.howItWorks.step1.title"),
      icon: QrCode,
      desc: t("landing.howItWorks.step1.desc"),
    },
    {
      num: "02",
      title: t("landing.howItWorks.step2.title"),
      icon: ClipboardCheck,
      desc: t("landing.howItWorks.step2.desc"),
    },
    {
      num: "03",
      title: t("landing.howItWorks.step3.title"),
      icon: Sparkles,
      desc: t("landing.howItWorks.step3.desc"),
    },
  ];

  return (
    <div>
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-28">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-charcoal sm:text-6xl"
              >
                {t("landing.hero.title1")}
                <br />
                {t("landing.hero.title2")}
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-md text-lg text-charcoal/70">
                {t("landing.hero.subtitle")}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/menyu"
                  className="focus-ring flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-moss"
                >
                  {t("landing.hero.orderCta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/kirish"
                  className="focus-ring rounded-full border border-charcoal/20 px-7 py-3.5 text-sm font-medium text-charcoal transition hover:border-charcoal/40"
                >
                  {t("landing.hero.ownerCta")}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"
                alt={t("landing.hero.imgAlt")}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </motion.div>
          </div>
        </section>

        {/* Biz haqimizda */}
        <section id="biz-haqimizda" className="border-t border-charcoal/10 bg-beige/40">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid gap-12 md:grid-cols-2 md:items-center"
            >
              <motion.div variants={fadeUp}>
                <p className="text-sm font-semibold uppercase tracking-widest text-moss">{t("landing.about.eyebrow")}</p>
                <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">{t("landing.about.title")}</h2>
                <p className="mt-5 max-w-md text-charcoal/70">{t("landing.about.body")}</p>
              </motion.div>
              <motion.div variants={fadeUp} className="overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=1200&auto=format&fit=crop"
                  alt={t("landing.about.imgAlt")}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Menu preview */}
        <section className="border-t border-charcoal/10">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="mb-12 flex items-end justify-between"
            >
              <motion.div variants={fadeUp}>
                <p className="text-sm font-semibold uppercase tracking-widest text-moss">
                  {t("landing.menuPreview.eyebrow")}
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold">{t("landing.menuPreview.title")}</h2>
              </motion.div>
              <motion.div variants={fadeUp} className="hidden md:block">
                <Link
                  to="/menyu"
                  className="focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-medium transition hover:border-charcoal/40"
                >
                  {t("landing.menuPreview.link")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
            >
              {previewItems.map((item) => (
                <motion.div
                  key={item.name}
                  variants={fadeUp}
                  className="group overflow-hidden rounded-2xl border border-charcoal/10 bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-display text-lg font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-charcoal/60">{item.price}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 text-center md:hidden">
              <Link
                to="/menyu"
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-medium"
              >
                {t("landing.menuPreview.link")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Qanday ishlaydi */}
        <section id="qanday-ishlaydi" className="border-t border-charcoal/10 bg-charcoal text-ivory">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-widest text-beige"
            >
              {t("landing.howItWorks.eyebrow")}
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mt-4 font-display text-4xl font-semibold"
            >
              {t("landing.howItWorks.title")}
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="mt-14 grid gap-10 md:grid-cols-3"
            >
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.num} variants={fadeUp}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-3xl font-semibold text-beige">{step.num}</span>
                      <Icon className="h-6 w-6 text-beige" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-lg font-semibold tracking-wide">{step.title}</p>
                    <p className="mt-2 text-sm text-ivory/60">{step.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Atmosphere photo */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="h-[50vh] w-full overflow-hidden md:h-[64vh]"
          >
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1920&auto=format&fit=crop"
              alt={t("landing.atmosphere.imgAlt")}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </section>

        {/* CTA */}
        <section className="border-t border-charcoal/10 bg-beige/40">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-3xl px-5 py-24 text-center"
          >
            <Coffee className="mx-auto h-8 w-8 text-moss" aria-hidden="true" />
            <h2 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">{t("landing.cta.title")}</h2>
            <p className="mt-4 text-charcoal/70">{t("landing.cta.subtitle")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/menyu"
                className="focus-ring rounded-full bg-charcoal px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-moss"
              >
                {t("landing.cta.button")}
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
