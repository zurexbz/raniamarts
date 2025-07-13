import React from "react";

/**
 * @param {string} label   – teks di bawah icon
 * @param {string|JSX} icon – string path gambar  ➜  "<img />"
 *                          – atau komponen JSX (contoh <Coffee />)
 */
const IconWithLabel = ({ label, icon }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300 overflow-hidden">
        {typeof icon === "string" ? (
          <img
            src={icon}
            alt={label}
            className="w-8 h-8 object-contain pointer-events-none select-none"
            draggable="false"
          />
        ) : (
          icon ?? <span className="text-3xl text-gray-400">✕</span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-600">{label}</p>
    </div>
  );
};

export default IconWithLabel;
