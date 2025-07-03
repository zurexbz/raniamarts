import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Carousel = () => {
  return (
    <div className="relative px-6 mt-4">
      <div className="bg-gradient-to-r from-blue-100 to-white rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold mb-2">
            Paket Hemat <br /> Bukber
          </h2>
          <p className="text-lg">Promo Bukber Ala Korea!</p>
          <p className="text-sm text-gray-500 font-medium mt-1">#BukaBersamaLebihAsyik</p>
        </div>
        <img
          src="https://www.mamasuka.com/uploads/product/thumb_topokki_rice_cake.png"
          alt="Topokki"
          className="w-64 object-cover"
        />
      </div>

      <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1">
        <ChevronLeft />
      </button>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1">
        <ChevronRight />
      </button>

      <div className="flex justify-center mt-4 space-x-2">
        {Array(6)
          .fill()
          .map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 0 ? "bg-gray-800" : "bg-gray-300"
              }`}
            ></span>
          ))}
      </div>
    </div>
  );
};

export default Carousel;
