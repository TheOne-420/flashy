"use client";

import HeroCard from "../HeroCard";

const cards = [
  {
    question: "What is capital of Delhi?",
    answer: "New Delhi",
    className: "left-0 top-0 rotate-[-18deg]",
  },
  {
    question: "Photosynthesis?",
    answer: "Plants convert sunlight into energy",
    className: "left-40 -top-2 rotate-[-8deg]",
  },
  {
    question: "Newton's 3rd Law",
    answer: "Every action has equal & opposite reaction",
    className: "left-80 top-0 rotate-0 z-10",
  },
  {
    question: "Capital of Japan?",
    answer: "Tokyo",
    className: "left-[28rem] top-2 rotate-[8deg]",
  },
  {
    question: "2 + 2 = ?",
    answer: "4",
    className: "left-[36rem] top-4 rotate-[18deg]",
  },
];

export default function Hero() {
  return (
    <section className="flex h-dvh w-dvw flex-col items-center bg-blue-600 py-12">
      <h1 className="font-bbh text-7xl text-balance text-white">
        Make studying <s className="strikethrough">boring</s> fun!
      </h1>

      <div className="relative mt-16 h-72 w-full max-w-4xl">
        {cards.map((card, i) => (
          <div
            key={"card" + i}
            className={`group absolute perspective-[1000px] ${card.className}`}
          >
            <div
              className={`relative h-44 w-32 cursor-pointer transition-all duration-500 transform-3d group-hover:transform-[rotateY(180deg)] md:h-48 md:w-36`}
            >
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
  );
}
