import Link from "next/link";
import { HeaderWrapper } from "@/components/header-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Zap,
  FileCheck,
  Lock,
  Clock,
  Shield,
  Upload,
  Search,
  Eye,
  FileText,
  Building2,
  Users,
  Timer,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-[200px] pb-[120px] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Blockchain-Powered Verification
            </span>
          </div>

          <h1 className="stagger-2 mx-auto mb-8 max-w-4xl animate-fade-in-up text-4xl leading-tight font-extrabold tracking-[-1px] text-foreground opacity-0 sm:text-5xl md:text-6xl md:leading-[1.08] lg:text-7xl xl:text-[84px]">
            The productivity app{' '}
            <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
              you&apos;ll actually
            </span>{' '}
            enjoy using
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            CertFyi anchors PDF document fingerprints on the blockchain,
            enabling anyone to verify document authenticity, issuer identity,
            and issuance timestamp without a central authority.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/verify">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto text-base h-12"
              >
                <FileCheck className="w-5 h-5" />
                Start Verifying
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto text-base h-12"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span>Decentralized & Trustless</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span>Instant Verification</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span>Zero Hidden Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform at a Glance Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Platform at a Glance
            </h2>
            <p className="text-xl text-muted-foreground">
              Real-time metrics from our blockchain verification network
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, value: "1200+", label: "Documents Verified" },
              {
                icon: Building2,
                value: "50+",
                label: "Registered Organizations",
              },
              { icon: Users, value: "400+", label: "Active Users" },
              { icon: Timer, value: "5s", label: "Average Verification Time" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/10 transition-all group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:ring-primary/20">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-border overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-l from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-r from-secondary/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to verify and issue blockchain-backed
              documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Public Verification",
                description:
                  "Upload any PDF to instantly verify its authenticity and issuer identity. No login required.",
              },
              {
                icon: Lock,
                title: "Single Document Issuance",
                description:
                  "Verified organizations can issue digital certificates with embedded blockchain proof.",
              },
              {
                icon: Zap,
                title: "Bulk Issuance",
                description:
                  "Issue hundreds of documents at once with gas-efficient Merkle tree batching.",
              },
              {
                icon: Clock,
                title: "Immutable Timestamps",
                description:
                  "Every document is anchored with an on-chain timestamp, creating permanent proof of issuance.",
              },
              {
                icon: FileCheck,
                title: "Revocation Management",
                description:
                  "Issuers can revoke documents when needed, instantly visible to all verifiers.",
              },
              {
                icon: Shield,
                title: "Multi-Chain Ready",
                description:
                  "Deploy on Ethereum or any EVM-compatible chain. Full decentralized governance.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/10 transition-all group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:ring-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-border bg-muted/20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to verify document authenticity
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Upload Your PDF",
                description:
                  "Drag and drop any PDF file into the verification portal. It takes just seconds.",
                icon: Upload,
              },
              {
                step: "02",
                title: "Instant Verification",
                description:
                  "Our system calculates the document hash and checks it against the blockchain in real-time.",
                icon: Search,
              },
              {
                step: "03",
                title: "View Results",
                description:
                  "See the issuer identity, issuance date, and proof on the blockchain explorer.",
                icon: Eye,
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border-border/50 bg-card/50 backdrop-blur transition-shadow hover:shadow-lg"
              >
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-primary-foreground">
                        {item.step}
                      </span>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Verify?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Start verifying documents instantly with CertFyi. No signup
            required.
          </p>
          <Link href="/verify" className={`${heroCta} w-full justify-center sm:w-auto`}>
            <Zap className="h-5 w-5" />
            Verify Your First PDF
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/15 px-6 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-button">
                <Shield className="h-5 w-5 text-foreground" aria-hidden />
              </div>
              <span className="text-lg font-bold text-foreground">CertFyi</span>
            </div>
            <p className="text-center text-sm font-semibold text-muted-foreground">
              &copy; 2026 CertFyi. Blockchain-powered PDF verification platform.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
