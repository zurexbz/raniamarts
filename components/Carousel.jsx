import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  { image: "/Carousel1.png", alt: "Banner1" },
  { image: "/Carousel2.png", alt: "Banner2" },
];

const slides = [
  banners[banners.length - 1],
  ...banners,
  banners[0],
];

const Carousel = () => {
  const [idx, setIdx] = useState(1);           // 1 = slide pertama “asli”
  const [enableTransition, setEnableTransition] = useState(true);

  const prev = () => {
    setEnableTransition(true);
    setIdx((i) => i - 1);
  };
  const next = () => {
    setEnableTransition(true);
    setIdx((i) => i + 1);
  };

  const onTransitionEnd = () => {
    if (idx === 0) {
      setEnableTransition(false);
      setIdx(banners.length);      // lompat diam‑diam ke last asli
    } else if (idx === banners.length + 1) {
      setEnableTransition(false);
      setIdx(1);                   // lompat diam‑diam ke first asli
    }
  };

  /* index asli 0..n‑1 untuk indikator bulat */
  const realIndex = (idx - 1 + banners.length) % banners.length;

  /* helper bila user klik dot */
  const goTo = (dotIndex) => {
    setEnableTransition(true);
    setIdx(dotIndex + 1);          // +1 karena ada clone di depan
  };

  return (
    <div className="relative mt-4 px-6">
      {/* SLIDER */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className={`flex ${enableTransition ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={s.alt}
              className="min-w-full select-none pointer-events-none"
              draggable="false"
            />
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1"
      >
        <ChevronRight />
      </button>

      <div className="flex justify-center mt-4 space-x-2">
        {banners.map((_, i) => (
          <span
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              i === realIndex ? "bg-gray-800" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel