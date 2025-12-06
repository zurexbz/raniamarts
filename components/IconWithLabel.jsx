import React from "react";

const IconWithLabel = ({ label, icon }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300">
        {typeof icon === "string" ? (
          <img
            src={icon}
            alt={label}
            className="w-12 h-12 object-contain select-none"
          />
        ) : (
          icon ?? <span className="text-3xl text-gray-400">✕</span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-600 select-none">{label}</p>
    </div>
  );
};

export default IconWithLabel;
