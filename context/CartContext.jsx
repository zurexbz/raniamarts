import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = "http://localhost:8080/api/v1";

const CartContext = createContext(null);

const getAuthToken = () =>
  localStorage.getItem("rm_token") || sessionStorage.getItem("rm_token");

const normalize = (json) => json?.data ?? json?.Data ?? json;

export const CartProvider = ({ children }) => {
  const [cartQty, setCartQty] = useState(0);

  const refreshCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCartQty(0);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) setCartQty(0);
        return;
      }

      const json = await res.json();
      const payload = normalize(json);

      const qty = payload?.total_qty ?? payload?.TotalQty ?? 0;
      setCartQty(Number(qty) || 0);
    } catch (e) {
      console.error("refreshCart error:", e);
    }
  }, []);

  const addToCart = useCallback(
    async (productId, qty) => {
      const token = getAuthToken();
      if (!token) return { ok: false, status: 401, message: "Unauthorized" };

      const res = await fetch(`${API_BASE_URL}/user/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(productId),
          qty: Number(qty),
        }),
      });

      const json = await res.json().catch(() => null);
      const payload = normalize(json);

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          message: json?.message || json?.Message || "Gagal menambahkan ke cart",
        };
      }

      const newQty = payload?.total_qty ?? payload?.TotalQty;
      if (typeof newQty === "number") setCartQty(newQty);
      else await refreshCart();

      return { ok: true, data: payload };
    },
    [refreshCart]
  );

  const clearCartState = useCallback(() => setCartQty(0), []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({ cartQty, refreshCart, addToCart, clearCartState }),
    [cartQty, refreshCart, addToCart, clearCartState]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
};
