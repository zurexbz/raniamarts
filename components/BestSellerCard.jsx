import React from "react";

const BestSellerCard = ({ image, name, price }) => {
  return (
    <div className="w-40 sm:w-56 bg-white rounded-xl overflow-hidden border shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="w-full aspect-square bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
          {name}
        </p>
        <p className="mt-1 text-sm font-bold text-red-500">Rp {price}</p>
      </div>
    </div>
  );
};

export default BestSellerCard;
