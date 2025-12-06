import React from "react";

const BestSellerCard = ({image, name, price}) => {
  // aspect-square -> rasio menjadi 1:1
  return(
    <div className="w-40 sm:w-56 bg-white rounded-xl overflow-hidden shadow-sm border">
      <div className="w-full aspect-square bg-gray-100"> 
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
          {name}
        </p>
        <p className="text-sm font-bold text-red-500">Rp {price}</p>
      </div>
    </div>
  )

}

export default BestSellerCard;