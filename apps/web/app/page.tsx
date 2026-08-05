import Link from "next/link";
import { HeaderWrapper } from "@/components/header-wrapper";
import { Features } from "@/components/features";
import { HeroStats } from "@/components/hero-stats";
import {
  Zap,
  ArrowRight,
  FileCheck,
  FileText,
  Building2,
  Users,
  Timer,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: FileCheck,
    title: "Upload your PDF",
    description:
      "Drag and drop any PDF into the verification portal. It takes just seconds.",
  },
  {
    icon: Zap,
    title: "Instant verification",
    description:
      "Our system calculates the document hash and checks it against the blockchain in real time.",
  },
  {
    icon: ShieldCheck,
    title: "View results",
    description:
      "See the issuer identity, issuance date, and proof on the blockchain explorer.",
  },
];

const heroCta =
  "inline-flex items-center gap-3 rounded-lg bg-card px-[28px] py-[16px] text-lg font-semibold text-foreground shadow-button transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0";

const heroCtaSecondary =
  "inline-flex items-center gap-3 rounded-lg border border-border/15 px-[28px] py-[16px] text-lg font-semibold text-foreground transition-all duration-300 ease-[var(--ease-premium)] hover:bg-muted/50 hover:-translate-y-0.5 active:translate-y-0";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-[200px] pb-[120px] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full opacity-[0.08]"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mx-auto mb-8 max-w-4xl text-4xl leading-tight font-extrabold tracking-[-1px] text-foreground sm:text-5xl md:text-6xl md:leading-[1.08] lg:text-7xl xl:text-[84px]">
            Trust every certificate.{" "}
            <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
              Instantly.
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            CertFyi anchors PDF document fingerprints on the blockchain,
            enabling anyone to verify document authenticity, issuer identity,
            and issuance timestamp without a central authority.
          </p>

          <div className="mb-13 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/verify" className={heroCta}>
              <FileCheck className="h-5 w-5" />
              Start Verifying
            </Link>
            <Link href="#how-it-works" className={heroCtaSecondary}>
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Verification Chain */}
          <div className="relative mx-auto mt-4 max-w-5xl">
            {/* connecting line between nodes — desktop only */}
            <div
              className="pointer-events-none absolute top-[22px] left-[12.5%] right-[12.5%] hidden h-px sm:block"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent) 15%, var(--accent) 85%, transparent)",
                opacity: 0.25,
              }}
            />

            <div className="relative grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-4 sm:gap-x-4">
              {[
                {
                  icon: FileText,
                  tag: "0x01",
                  value: "1,200+",
                  label: "Documents verified",
                },
                {
                  icon: Building2,
                  tag: "0x02",
                  value: "50+",
                  label: "Organizations onboarded",
                },
                {
                  icon: Users,
                  tag: "0x03",
                  value: "400+",
                  label: "Active users",
                },
                {
                  icon: Timer,
                  tag: "0x04",
                  value: "5s",
                  label: "Avg. verification time",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col items-center text-center"
                >
                  {/* node */}
                  <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm transition-all duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-1 group-hover:border-accent/50 group-hover:shadow-glow">
                    <stat.icon
                      className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-accent"
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="mb-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground/50 uppercase">
                    {stat.tag}
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <HeroStats /> */}
        </div>
      </section>

      <Features />

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative -mt-37 px-6 py-24 sm:px-8 sm:py-32 lg:px-10"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.03]"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl leading-tight font-extrabold tracking-[-1px] text-foreground sm:text-4xl md:text-5xl lg:text-[60px] lg:leading-[1.12]">
              How It Works
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Three simple steps to verify document authenticity
            </p>
          </div>

          <div className="relative">
            {/* connecting line through the node centers */}
            <div
              className="absolute top-6 bottom-6 left-6 w-px sm:top-7 sm:bottom-7 sm:left-7"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent) 0%, var(--border) 60%, transparent 100%)",
                opacity: 0.3,
              }}
            />

            <div className="space-y-12">
              {STEPS.map((item, idx) => (
                <div
                  key={item.title}
                  className="group relative flex items-start gap-6 sm:gap-8"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card shadow-soft transition-all duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:border-accent/50 group-hover:shadow-glow sm:h-14 sm:w-14">
                    <item.icon
                      className="h-5 w-5 text-accent transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6"
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="flex-1 pt-1 sm:pt-2">
                    <div className="mb-1.5 font-mono text-xs font-medium tracking-[0.15em] text-muted-foreground/60 uppercase">
                      Step {String(idx + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-2 text-2xl font-extrabold tracking-[-0.8px] text-foreground sm:text-3xl lg:text-[30px]">
                      {item.title}
                    </h3>
                    <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 -mt-35 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl leading-tight font-extrabold tracking-[-1px] text-foreground sm:text-4xl md:text-5xl lg:text-[60px] lg:leading-[1.12]">
            Ready to{" "}
            <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
              Verify
            </span>
            ?
          </h2>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start verifying documents instantly with CertFyi. No signup
            required.
          </p>
          <Link
            href="/verify"
            className={`${heroCta} w-full justify-center sm:w-auto`}
          >
            <Zap className="h-5 w-5" />
            Verify Your First PDF
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/15 px-6 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/certFYI-logo.png"
                  alt="CertFyi Logo"
                  className="h-10 w-auto"
                />
              </div>
            </div>
            <p className="text-center text-sm font-semibold text-muted-foreground">
              &copy; 2026 CertFyi. Blockchain-powered PDF verification platform.
            </p>
            <div className="flex gap-8 text-sm">
              {["Privacy", "Terms", "Docs"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="font-semibold text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
