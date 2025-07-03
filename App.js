import React from "react";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import CategoryList from "./components/CategoryList";

function App() {
  return (
    <div className="font-sans bg-white text-gray-800">
      <Header />
      <hr className="border-gray-200" />
      <Carousel />
      <CategoryList />
    </div>
  );
}

export default App;
    