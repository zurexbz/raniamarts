import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Phone, User as UserIcon } from "lucide-react";

// useState -> menyimpan state atau posisi terakhir dari suatu elemen
// misal aku punya state untuk klik view password

const API_BASE = "http://localhost:8080";

// Carousel
const slides = [
  {
    id: 1,
    image: null, // contoh: "/images/login-1.png"
    title: "Kelola pesanan dengan cepat",
    caption: "Pantau pesanan dan stok kapan saja, di mana saja.",
  },
  {
    id: 2,
    image: null, // contoh: "/images/login-2.png"
    title: "Semua kebutuhan dalam satu tempat",
    caption: "RaniaMart bantu kamu mengatur operasional lebih rapi.",
  },
];

const Register = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();

  const passwordMismatch = confirmPwd !== "" && pwd !== "" && pwd !== confirmPwd;
  const passwordTooShort = pwd !== "" && pwd.length < 8;

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    pwd.trim() !== "" &&
    confirmPwd.trim() !== "" &&
    !passwordMismatch &&
    !passwordTooShort &&
    !loading;

  // Auto Slide setiap 5 detik (kalau slide > 1)
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/raniamarts/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone_number: phoneNumber, password: pwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Registrasi gagal, silakan cek kembali data kamu."
        );
      }

      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center">
        {/* KIRI - FORM REGISTER */}
        <div className="relative max-w-[520px] w-full mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            RaniaMart
          </h1>

          <div className="bg-gradient-to-br from-sky-50/95 via-white/95 to-sky-100/90 backdrop-blur-xl border border-sky-100/70 shadow-[0_24px_60px_rgba(15,23,42,0.16)] rounded-[26px] px-7 py-8 md:px-8 md:py-9">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Register
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Silahkan daftarkan akun anda
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              {/* NAME */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full bg-sky-50/90 border border-sky-100 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900/40"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="albert@ajg.com"
                  className="w-full bg-sky-50/90 border border-sky-100 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900/40"
                />
              </div>

              {/* PHONE NUMBER */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-sky-50/90 border border-sky-100 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900/40"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-sky-50/90 border border-sky-100 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Konfirmasi password"
                  className="w-full bg-sky-50/90 border border-sky-100 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900/40"
                />
              </div>

              {/* VALIDATION TEXT */}
              {passwordTooShort && (
                <p className="text-xs text-orange-500">
                  Password minimal 8 karakter.
                </p>
              )}
              {passwordMismatch && (
                <p className="text-xs text-red-500">
                  Password dan konfirmasi password tidak sama.
                </p>
              )}
              {errorMsg && (
                <p className="text-xs text-red-500 pt-1">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full mt-2 rounded-xl py-3 text-sm font-semibold transition shadow-lg ${
                  canSubmit
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                {loading ? "Memproses..." : "Register"}
              </button>
            </form>

            <p className="mt-5 text-xs md:text-sm text-center text-slate-600">
              Sudah memiliki akun?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#f26464] hover:underline"
              >
                Login disini
              </Link>
            </p>
          </div>
        </div>

        {/* KANAN - AREA CAROUSEL */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-full flex justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2rem] bg-sky-100/70 border border-sky-100 shadow-[0_24px_60px_rgba(15,23,42,0.12)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-4 rounded-[1.8rem] bg-white/25 backdrop-blur-2xl border border-white/50 shadow-2xl overflow-hidden flex items-center justify-center">
                {slides[currentSlide]?.image ? (
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-200/70 via-sky-100/80 to-slate-100/90 flex flex-col items-center justify-center text-center px-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {slides[currentSlide]?.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {slides[currentSlide]?.caption}
                    </p>
                  </div>
                )}
              </div>

              {slides.length > 0 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => handleDotClick(index)}
                      className={`transition-all ${
                        index === currentSlide
                          ? "w-8 h-1.5 rounded-full bg-slate-900"
                          : "w-1.5 h-1.5 rounded-full bg-slate-400/70 hover:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
