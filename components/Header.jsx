import React from "react";
import { ShoppingCart, User, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white">
      <h1 className="text-2xl font-bold">RaniaMart</h1>
      <div className="flex items-center w-1/2 relative">
        <input
          type="text"
          placeholder="Search Bar"
          className="w-full border rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring"
        />
        <Search className="absolute left-3 text-gray-400" size={20} />
      </div>
      <div className="flex gap-6 items-center">
        <button className="flex items-center gap-1">
          <User size={20} />
          <span className="font-medium">Masuk/Daftar</span>
        </button>
        <button>
          <ShoppingCart size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
