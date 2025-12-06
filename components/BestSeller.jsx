import React from "react";
import BestSellerCard from "./BestSellerCard";

const bestSellers = [
    { name: "Tteokbokki & Saus 100gr", price: "25.000", image: "/menu/Tteokbokki.jpg", link: "/menu/tteokbokki" },
    { name: "Crispy Chicken Gulai", price: "20.000", image: "/menu/gulai-ayam.jpg", link: "/menu/gulai" },
    { name: "Chicken Buldak Boneless", price: "15.000", image: "/menu/boneless.jpg", link: "/menu/buldak" },
    { name: "Potato Sausage & Flaming Potato Corn Sausage", price: "15.000", image: "/menu/corndog.jpg", link: "/menu/corndog" },
    { name: "Caramel Machito", price: "15.000", image: "/menu/caramel.jpg", link: "/menu/caramel" },
    { name: "Fresh Mango Juice", price: "20.000", image: "/menu/mango.jpg", link: "/menu/mango" },
    { name: "Tuna Onigiri Spicy", price: "13.000", image: "/menu/onigiri.jpg", link: "/menu/onigiri" },
]

const BestSellers = () => {
    return (
        <div className="px-8 py-4">
            <div className="flex items-center justify-between border-b border-gray-200 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-4 border-gray-600">
                    Terlaris Bulan Ini!
                </h2>
                <a href="/menu-terlaris" className="text-sm text-gray-600 hover:underline">View All Menu &gt;</a>
            </div>
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                {bestSellers.map((item, i) => (
                    <a href={item.link} key={i}>
                        <BestSellerCard
                            image={item.image} // Parameter 1: image
                            name={item.name} // Parameter 2: name
                            price={item.price} // Parameter 3: price
                        />
                    </a>
                ))}
            </div>
        </div>
    )
}

export default BestSellers;
