import { ChevronLeft, ChevronRight } from "lucide-react";
import React, {useState} from "react";

const banners = [
  { image: "/Carousel1.png", alt: "Banner1" }, //1 
  { image: "/Carousel2.png", alt: "Banner2" }, //2
];

const slides = [
  banners[banners.length - 1], // 1 banner clone halaman terakhir [0]
  ...banners, // 2 banner [1, 2]
  banners[0], // 1 bannner clone halaman pertama [3]
]

//  Banner1, Banner2

//  Copy Banner3, Banner1, Banner2, Banner3,   Copy Banner1
//       0      ,    1   ,    2   ,      3  ,       4

//  Posisiku di Banner 1 -> indexnya kan 1
//  Kemudian aku pencet previous button -> index berubah menjadi 0
//  onTransitionEnd ketika dideteksi 0, maka nilai index akan dioper/diubah menjadi 2

const Carousel = () => {
  const [idx, setIdx] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true)
  
  const prev = () => {
    setEnableTransition(true);
    setIdx((i) => i - 1); //Misal kita di useState(2) = dikurangi 1 menjadi useState(1)
  };

  const next = () => {
    setEnableTransition(true);
    setIdx((i) => i + 1); //Misal kita di useState(2) = ditambah 1 menjadi useState(3)
  };

  const onTransitionEnd = () => {
    if (idx === 0) { //clone halaman terakhir
      setEnableTransition(false);
      setIdx(banners.length) // awalnya useState (0) diubah menjadi 3 (halaman real ketiga)
    } else if (idx === banners.length + 1){ //banners 3 + 1 = 4 maka 4 adalah clone halaman pertama
      setEnableTransition(false);
      setIdx(1); // awalnya useState (4) diubah menjadi 1 (halaman real pertama)
    }
  }

  const realIndex = (idx - 1 + banners.length) % banners.length;

  const goTo = (dotIndex) => {
    setEnableTransition(true)
    setIdx(dotIndex + 1) //2 + 1
  }

  return (
    <div className="relative mt-8 px-8">
      <div className="overflow-hidden rounded-2xl shadow">
        <div
          className={`flex ${enableTransition ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${idx * 100}%)`}}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={s.alt}
              className="min-w-full select-none pointer-events-none"
            />
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {banners.map((_, i) => (
          <span
            key={i} // idx nya masih 2
            onClick={() => goTo(i)} // Pindah ke Banner3 karena kita klik button 3, idx nya berubah menjadi 3
            className={`w-2 h-2 rounded-full cursor-pointer ${
              i === realIndex ? "bg-gray-800" : "bg-gray-300"
            }`} // realIndex, ketika dimasukkan ke rumus (3 - 1 + 3)% 3 = 2
                // i = 2, realIndex = 2 maka dia akan menyala
          />
            // button1 button2 button3
            //   0       1       2
        ))}
      </div>
    </div>
  )
}

export default Carousel