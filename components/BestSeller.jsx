import React, { useEffect, useMemo, useState } from "react";
import BestSellerCard from "./BestSellerCard";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/v1";

const BestSellers = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home`);

        if (!res.ok) {
          console.error("Gagal fetch /home, status:", res.status);
          setMenus([]);
          return;
        }

        const data = await res.json();
        const all = data.all_list_product || data.AllListProduct || [];

        const mapped = all.map((p) => ({
          id: p.product_id,
          name: p.nama_menu,
          price: p.harga,
          stock: p.stok,
          image: p.image_id
            ? `${API_BASE_URL}/home/${p.image_id}`
            : undefined,
        }));

        setMenus(mapped);
      } catch (err) {
        console.error("Error fetch /home:", err);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const bestSeven = useMemo(() => {
    if (!menus.length) return [];
    const sorted = [...menus].sort((a, b) => {
      const sa = a.stock ?? 0;
      const sb = b.stock ?? 0;
      return sa - sb;
    });
    return sorted.slice(0, 10);
  }, [menus]);

  if (loading) return null;
  if (!bestSeven.length) return null;

  return (
    <div className="px-8 py-4">
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-4 border-gray-600">
          Terlaris Bulan Ini!
        </h2>
        <a href="/menu-terlaris" className="text-sm text-gray-600 hover:underline">
          View All Menu &gt;
        </a>
      </div>

      <div className="flex gap-8 overflow-x-auto scrollbar-hide">
        {bestSeven.map((item) => (
          <Link key={item.id} to={`/menu/${item.id}`} className="flex-none">
            <BestSellerCard
              image={item.image}
              name={item.name}
              price={item.price.toLocaleString("id-ID")}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
