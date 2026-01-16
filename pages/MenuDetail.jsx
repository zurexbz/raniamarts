import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const API_BASE_URL = "http://localhost:8080/api/v1";

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home`);

        if (!res.ok) {
          console.error("Gagal fetch /home, status:", res.status);
          setMenu(null);
          return;
        }

        const data = await res.json();
        const all = data.all_list_product || data.AllListProduct || [];

        const found = all.find(
          (p) => String(p.product_id) === String(id)
        );

        if (!found) {
          setMenu(null);
          return;
        }

        setMenu({
          id: found.product_id,
          name: found.nama_menu,
          type: found.tipe_menu,
          price: found.harga,
          description: found.deskripsi,
          stock: found.stok,
          image: found.image_id
            ? `${API_BASE_URL}/home/${found.image_id}`
            : undefined,
        });
      } catch (err) {
        console.error("Error fetch detail menu:", err);
        setMenu(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const maxStock = useMemo(
    () =>
      menu && typeof menu.stock === "number" ? Math.floor(menu.stock) : 0,
    [menu]
  );

  const handleDecrease = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (!maxStock) {
      setQty((prev) => prev + 1);
    } else {
      setQty((prev) => Math.min(maxStock, prev + 1));
    }
  };

  const outOfStock = useMemo(() => maxStock === 0, [maxStock]);

  const handleAddToCart = async () => {
    if (!menu) return;

    if (outOfStock) {
      alert("Stok habis.");
      return;
    }

    if (maxStock && qty > maxStock) {
      alert(`Qty melebihi stok. Maksimal ${maxStock}.`);
      return;
    }

    setAdding(true);
    try {
      const res = await addToCart(menu.id, qty);

      if (!res.ok) {
        if (res.status === 401) {
          alert("Silakan login dulu untuk menambahkan ke keranjang.");
          navigate("/login");
          return;
        }
        alert(res.message || "Gagal menambahkan ke keranjang.");
        return;
      }

      alert("Berhasil ditambahkan ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    alert("Fitur beli langsung akan ditambahkan nanti");
  };

  const formatPrice = (val) =>
    typeof val === "number" ? val.toLocaleString("id-ID") : val || "-";

  const subtotal = useMemo(() => {
    if (!menu || typeof menu.price !== "number") return 0;
    return menu.price * qty;
  }, [menu, qty]);
  

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-10 py-6">
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-500 mb-4 flex flex-wrap gap-1 items-center">
          <button
            type="button"
            onClick={handleBack}
            className="text-sky-600 hover:underline mr-2"
          >
            &lt; Kembali
          </button>
          <Link to="/" className="hover:underline text-gray-600">
            Home
          </Link>
          {menu?.type && (
            <>
              <span>/</span>
              <span className="text-gray-600">{menu.type}</span>
            </>
          )}
          {menu?.name && (
            <>
              <span>/</span>
              <span className="text-gray-800 font-medium truncate max-w-[40vw]">
                {menu.name}
              </span>
            </>
          )}
        </nav>

        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Memuat detail menu...
          </div>
        ) : !menu ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Menu tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gambar */}
              <div className="bg-white rounded-2xl shadow-sm border p-4 flex justify-center items-center">
                <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Tidak ada gambar
                    </div>
                  )}
                </div>
              </div>

              {/* Detail nama, harga, deskripsi */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                  {menu.name}
                </h1>

                <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-4">
                  Rp {formatPrice(menu.price)}
                </div>

                <div className="border-b border-gray-200 mb-4">
                  <button
                    type="button"
                    className="px-1 pb-2 text-sm sm:text-base font-semibold text-sky-700 border-b-2 border-sky-500"
                  >
                    Detail Produk
                  </button>
                </div>

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {menu.description || "Belum ada deskripsi untuk menu ini."}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Atur jumlah dan lihat total
                </h2>

                {/* Harga unit */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    Harga per porsi
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    Rp {formatPrice(menu.price)}
                  </span>
                </div>

                {/* Stok */}
                <p className="text-xs text-gray-500 mb-4">
                  Stok total:{" "}
                  <span className="font-medium text-gray-700">
                    {maxStock}
                  </span>
                </p>

                {/* Counter qty */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-700">Jumlah</span>
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      className="w-9 h-9 flex items-center justify-center text-lg text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <div className="w-10 text-center text-sm font-semibold">
                      {qty}
                    </div>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      className="w-9 h-9 flex items-center justify-center text-lg text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-gray-700">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                  className={`w-full mb-3 py-3 rounded-full text-white text-sm font-semibold transition ${
                    outOfStock || adding
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {adding ? "Menambahkan..." : "+ Keranjang"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3 rounded-full border border-sky-600 text-sky-600 hover:bg-sky-50 text-sm font-semibold transition"
                >
                  Beli Langsung
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MenuDetail;
