"use client";

import HeroCard from "../HeroCard";

export default function Hero() {
  return (
    <section className="flex not-dark:text-white h-dvh w-dvw flex-col gap-12 items-center bg-primary py-12">
      <h1 className="text-7xl text-balance font-bbh">
        Make studying <s className="strikethrough">boring</s> fun!
      </h1>
      <div>Images</div>
      <HeroCard>
        What is 
      </HeroCard>
      
    </section>
  );
}
