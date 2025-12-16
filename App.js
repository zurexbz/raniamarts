import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Header from "./components/Header";
import Carousel from "./components/Carousel";
import CategoryList from "./components/CategoryList";
import BestSeller from "./components/BestSeller";
import Footer from "./components/Footer";

import AllMenu from "./pages/AllMenu";
import MenuDetail from "./pages/MenuDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/AdminDashboard";
import AddMenu from "./pages/AdminAddMenu";

const Home = () => (
    <div className="font-sans bg-white text-gray-800">
      <Header />
      <hr className="border-gray-200" />
      <Carousel />
      <CategoryList />
      <BestSeller />
      <Footer />
    </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Home />}/> { /* Page 1: Route untuk home page localhost:3000 */}
        <Route path="/menu-terlaris" element={<AllMenu />} />
        <Route path="/menu/:id" element={<MenuDetail />} />
        <Route path="/menus" element={<AllMenu />} />

        {/* User Setting */}
        <Route path="/login" element={<Login />}/> { /* Page 2: Halaman login page localhost:3000/login */}
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/menus/new" element={<AddMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
