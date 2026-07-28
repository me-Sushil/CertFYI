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

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Blockchain-Powered Verification
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Verify Any PDF
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              on the Blockchain
            </span>
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
      </section>

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

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Verify?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Start verifying documents instantly with CertFyi. No signup
            required.
          </p>
          <Link href="/verify">
            <Button size="lg" className="gap-2 text-base h-12">
              <Zap className="w-5 h-5" />
              Verify Your First PDF
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">CertFyi</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2026 CertFyi. Blockchain-powered PDF verification platform.
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
