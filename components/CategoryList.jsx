import React from "react";
import IconWithLabel from "./IconWithLabel";

const categories = [
  { name: "Promo April",       icon: "/icons/promo.png" },
  { name: "Ready Meal",        icon: "/icons/readymeal.png" },
  { name: "Korean Food",       icon: "/icons/korean.png" },
  { name: "Fresh Drink",       icon: "/icons/drink.png" },
  { name: "Snack Time",        icon: "/icons/snack.png" },
  { name: "Premium Fruit",     icon: "/icons/fruit.png" },
  { name: "Ice Cream",         icon: "/icons/icecream.png" },
  { name: "Bakery & Pastries", icon: "/icons/bakery.png" },
];

const CategoryList = () => (
  <div className="px-6 py-8 grid grid-cols-4 sm:grid-cols-8 gap-4">
    {categories.map((cat, i) => (
      <IconWithLabel key={i} label={cat.name} icon={cat.icon} />
    ))}
  </div>
);

export default CategoryList;
