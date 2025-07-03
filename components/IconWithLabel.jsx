import React from "react";

const IconWithLabel = ({ label }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300">
        {/* Placeholder icon */}
        <div className="text-3xl text-gray-400">✕</div>
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-600">{label}</p>
    </div>
  );
};

export default IconWithLabel;
