import React from "react";
import IconWithLabel from "./IconWithLabel";

const categories = [
  { name: "Promo April" },
  { name: "Ready Meal" },
  { name: "Korean Food" },
  { name: "Fresh Drink" },
  { name: "Snack Time" },
  { name: "Premium Fruit" },
  { name: "Ice Cream" },
  { name: "Bakery & Pastries" },
];

const CategoryList = () => {
  return (
    <div className="px-6 py-6 grid grid-cols-4 sm:grid-cols-8 gap-4">
      {categories.map((cat, idx) => (
        <IconWithLabel key={idx} label={cat.name} />
      ))}
    </div>
  );
};

export default CategoryList;
