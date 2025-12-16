import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BestSellerCard from "../components/BestSellerCard";
import { Link, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/v1";
const PAGE_SIZE = 30; 

const AllMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevant");
  const [page, setPage] = useState(1);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const keyword = (params.get("keyword") || "").trim().toLowerCase();

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
          image: p.image_id ? `${API_BASE_URL}/home/${p.image_id}` : undefined,
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

  const filteredMenus = useMemo(() => {
    if (!keyword) return menus;
    return menus.filter((m) =>
      (m.name || "").toLowerCase().includes(keyword)
    );
  }, [menus, keyword]);

  const sortedMenus = useMemo(() => {
    const arr = [...filteredMenus];

    if (sort === "cheap") {
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "expensive") {
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return arr;
  }, [filteredMenus, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedMenus.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [sort, keyword]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageItems = sortedMenus.slice(startIndex, endIndex);

  const shownFrom = sortedMenus.length === 0 ? 0 : startIndex + 1;
  const shownTo = Math.min(endIndex, sortedMenus.length);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Menu dari RaniaMart siap mengenyangkanmu!
            </h1>
            <p className="text-sm text-gray-600">
              Menampilkan {shownFrom}-{shownTo} dari {sortedMenus.length} menu
              {keyword && (
                <>
                  {" "}
                  untuk kata kunci{" "}
                  <span className="font-semibold">"{keyword}"</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Urutkan:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
              }}
              className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="relevant">Paling Sesuai</option>
              <option value="cheap">Paling Murah</option>
              <option value="expensive">Paling Mahal</option>
            </select>
          </div>
        </div>

        {/* Grid menu */}
        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Memuat menu...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Belum ada menu yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pageItems.map((item) => (
              <Link
                key={item.id}
                to={`/menu/${item.id}`}
                className="block"
                >
                <BestSellerCard
                    image={item.image}
                    name={item.name}
                    price={
                    typeof item.price === "number"
                        ? item.price.toLocaleString("id-ID")
                        : item.price
                    }
                />
            </Link>
            ))}
          </div>
        )}

        {sortedMenus.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              &lt; Prev
            </button>

            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next &gt;
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllMenu;
