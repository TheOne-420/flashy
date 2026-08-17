"use client";

import {
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  Target,
  Users,
  Shield,
  Zap,
  Brain,
  Clock,
  Award,
  LucideX,
  LucideTicket,
  LucideCheck,
} from "lucide-react";
import GradualBlur from "@/components/GradualBlur";
import { authClient, useSession } from "@/lib/auth-client";
const cards = [
  { question: "Largest Mammal?", answer: "Blue Whale" },
  {
    question: "Photosynthesis?",
    answer: "Plants convert sunlight into energy",
  },
  {
    question: "Newton's 3rd Law",
    answer: "Every action has equal & opposite reaction",
  },
  { question: "Capital of Japan?", answer: "Tokyo" },
  { question: "Boy in Spanish?", answer: "chico" },
];
import { Button } from "@/components/ui/button";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Grainient from "@/components/Grainient";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
const features = [
  {
    icon: Brain,
    title: "AI-Powered",
    desc: "Smart flashcards generated instantly",
  },
  {
    icon: Zap,
    title: "Gamified",
    desc: "Earn points and maintain streaks",
  },
  {
    icon: Clock,
    title: "Spaced Repetition",
    desc: "Remember more with less effort",
  },
  {
    icon: Award,
    title: "Track Progress",
    desc: "See your improvement over time",
  },
];

const stats = [
  { value: "2M+", label: "Cards Created" },
  { value: "500K+", label: "Active Students" },
  { value: "98%", label: "Pass Rate" },
];

const testimonials = [
  {
    quote: "Helped me get an A in Organic Chemistry!",
    name: "Sarah K.",
    role: "Biology Major",
  },
  {
    quote: "Best study app I've ever used",
    name: "Mike T.",
    role: "High School Student",
  },
  {
    quote: "Made learning actually fun",
    name: "Jamie L.",
    role: "College Freshman",
  },
];

export default function Landing() {
  const session = useSession();
  const handleLogOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  console.log("Session:", session.data);
  return (
    <div className="relative w-full bg-blue-900">
      <header className="fixed top-5 left-1/2 z-50 -translate-x-1/2 px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-white shadow-xl backdrop-blur-md">
          {/* Left */}
          <div className="flex items-center">
            <div className="font-bbh text-2xl tracking-wide">Flashy</div>
          </div>

          {/* Center */}
          <nav className="flex items-center justify-center gap-8 text-sm font-medium">
            <Link href="/study" className="transition hover:text-white/70">
              Study
            </Link>
            {/*<a href="#" className="transition hover:text-white/70">
              Features
            </a>
            <a href="#" className="transition hover:text-white/70">
              Pricing
            </a>*/}
          </nav>

          {/* Right */}
          <div className="flex items-center justify-end gap-3">
            {session.data?.user ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="cursor-pointer rounded-full">
                    <Avatar className="h-9 w-9 border border-white/15">
                      <AvatarImage src={session.data.user.image ?? ""} />
                      <AvatarFallback className="bg-white/10 text-white">
                        {session.data.user.name?.charAt(0)?.toUpperCase() ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </HoverCardTrigger>

                <HoverCardContent
                  align="end"
                  className="w-72 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 text-white shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.data.user.image ?? ""} />
                      <AvatarFallback>
                        {session.data.user.name?.charAt(0)?.toUpperCase() ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {session.data.user.name ?? "User"}
                      </p>
                      <p className="truncate text-sm text-white/60">
                        {session.data.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Link
                      href="/study"
                      className="block rounded-xl px-3 py-2 text-sm transition hover:bg-white/10"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      className="block rounded-xl px-3 py-2 text-sm transition hover:bg-white/10"
                    >
                      Settings
                    </Link>

                    <DropdownMenuSeparator />
                    <Button
                      onClick={handleLogOut}
                      variant="destructive"
                      className="mt-2 w-full rounded-xl px-3"
                    >
                      Sign Out
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Link
                href="/auth"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Join Us
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-primary pt-30 pb-12">
        {" "}
        {/* Background wrapper */}
        <div className="absolute inset-0 h-full w-full">
          <div className="relative h-full w-full">
            <Grainient
              color1="#84CC16"
              color2="#4144d7"
              color3="#946fd5"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={-0.37}
              centerY={0}
              zoom={0.9}
            />
          </div>
        </div>
        <div className="relative z-10 flex w-full flex-col items-center">
          <h1 className="font-bbh text-7xl text-balance text-white">
            Make studying <s className="strikethrough">boring</s> fun!
          </h1>
          <p className="mt-4 text-xl text-white/80">
            Flashcards that make learning addictive
          </p>
          <button className="mt-8 rounded-full bg-white px-8 py-4 text-lg font-bold text-primary">
            Start Learning Free <ArrowRight className="ml-2 inline h-5 w-5" />
          </button>
          {/* Flip Cards   */}
          <div className="mt-16 flex h-72 w-full max-w-5xl items-center justify-center gap-4 overflow-x-auto px-4">
            {cards.map((card, i) => (
              <div
                key={"card" + i}
                className="group relative shrink-0 transition-all duration-300 perspective-[1000px] hover:z-50 hover:translate-x-2"
              >
                <div className="relative h-44 w-32 cursor-pointer font-bold transition-all duration-500 transform-3d group-hover:transform-[rotateY(180deg)] md:h-48 md:w-36">
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10 bg-blue-500 p-3 shadow-xl backface-hidden">
                    <span className="text-center text-sm leading-snug text-white">
                      {card.question}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex transform-[rotateY(180deg)] items-center justify-center rounded-2xl bg-blue-700 p-3 shadow-2xl shadow-white backface-hidden">
                    <span className="z-50 text-center text-sm leading-snug text-white">
                      {card.answer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="flex w-full flex-col items-center bg-blue-800 py-20">
        <h2 className="font-bbh text-4xl text-white">
          Why you would love Flashy
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl bg-blue-700 p-6 text-center"
            >
              <feature.icon className="h-10 w-10 text-white" />
              <h3 className="mt-4 text-lg font-bold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-white/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="w-full bg-blue-800 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-bbh text-4xl text-white">
            Traditional studying vs Flashy
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Before - Boring */}
            <div className="rounded-3xl border border-red-500/30 bg-red-900 p-8">
              <Badge className="mb-4" variant="secondary">
                {" "}
                Old Way
              </Badge>

              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-2">
                  <LucideX />
                  Reading textbooks for hours
                </li>
                <li className="flex items-start gap-2">
                  <LucideX />
                  Forgetting everything by exam day
                </li>
                <li className="flex items-start gap-2">
                  <LucideX />
                  No idea what to focus on
                </li>
                <li className="flex items-start gap-2">
                  <LucideX />
                  Studying feels like a chore
                </li>
              </ul>
            </div>

            {/* After - Flashy */}
            <div className="rounded-3xl border border-green-500/30 bg-green-900 p-8">
              <Badge className="mb-4" variant="secondary">
                Flashy
              </Badge>

              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-2">
                  <LucideCheck />
                  5-minute focused sessions
                </li>
                <li className="flex items-start gap-2">
                  <LucideCheck />
                  AI reminds you at perfect intervals
                </li>
                <li className="flex items-start gap-2">
                  <LucideCheck />
                  Smart algorithm shows weak spots
                </li>
                <li className="flex items-start gap-2">
                  <LucideCheck />
                  Gamified progress = addictive
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="flex w-full flex-col items-center bg-primary py-20">
        <h2 className="font-bbh text-4xl text-white">
          Ready to make studying fun?
        </h2>
        <button className="mt-8 rounded-full bg-white px-8 py-4 text-lg font-bold text-primary">
          Get Started <ArrowRight className="ml-2 inline h-5 w-5" />
        </button>
      </section>
      {/* Footer */}
      <footer className="flex h-full w-full flex-col items-center bg-blue-900 py-8 pb-32 text-white/40">
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white">
            About
          </a>
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
        </div>
        <p className="mt-4 text-sm">© 2026 Flashy. All rights reserved.</p>
      </footer>
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50">
        <GradualBlur
          target="parent"
          position="bottom"
          height="7rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential
          opacity={1}
        />
      </div>
    </div>
  );
}
