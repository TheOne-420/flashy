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
} from "lucide-react";

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
  return (
    <div className="w-full">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-primary px-8 py-4">
        <div className="font-bbh text-2xl text-white">Flashy</div>
        <nav className="flex gap-8 text-white">
          <a href="#" className="hover:text-primary-foreground">
            Home
          </a>
          <a href="#" className="hover:text-primary-foreground">
            Features
          </a>
          <a href="#" className="hover:text-primary-foreground">
            Pricing
          </a>
          <a href="#" className="hover:text-primary-foreground">
            Login
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-dvh w-full flex-col items-center bg-primary pt-24 pb-12">
        <h1 className="font-bbh text-7xl text-balance text-white">
          Make studying <s className="strikethrough">boring</s> fun!
        </h1>

        <p className="mt-4 text-xl text-white/80">
          Flashcards that make learning addictive
        </p>

        <button className="mt-8 rounded-full bg-white px-8 py-4 text-lg font-bold text-primary">
          Start Learning Free <ArrowRight className="ml-2 inline h-5 w-5" />
        </button>

        {/* Flip Cards - Single row spread horizontally */}
        <div className="mt-16 flex h-72 w-full max-w-5xl items-center justify-center gap-4 overflow-x-auto px-4">
          {cards.map((card, i) => (
            <div
              key={"card" + i}
              className="group relative shrink-0 transition-all duration-300 perspective-[1000px] hover:z-50 hover:translate-x-2"
            >
              <div className="relative h-44 w-32 cursor-pointer transition-all duration-500 transform-3d group-hover:transform-[rotateY(180deg)] md:h-48 md:w-36">
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10 bg-blue-500 p-3 shadow-xl backface-hidden">
                  <span className="text-center text-sm leading-snug font-medium text-white">
                    {card.question}
                  </span>
                </div>
                <div className="absolute inset-0 flex transform-[rotateY(180deg)] items-center justify-center rounded-2xl bg-blue-700 p-3 shadow-xl backface-hidden">
                  <span className="z-50 text-center text-sm leading-snug font-semibold text-white">
                    {card.answer}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
      <footer className="flex w-full flex-col items-center bg-blue-900 py-8 text-white/40">
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
    </div>
  );
}
