import React from "react";
import {
  MapPin,
  MessageCircle,
  PhoneCall,
  Instagram,
  Music2,
} from "lucide-react";

const Footer = () => {
  const lat = -7.324856;
  const lon = 112.779417;

  const mapSrc = `https://www.google.com/maps?hl=id&q=${lat},${lon}&ll=${lat},${lon},&z=16&output=embed`;

  return (
    <footer className="relative mt-10 bg-[#EAF6FB] overflow-hidden">
      {/* DECORATION CIRCLE RIGHT */}
      <div className="pointer-events-none absolute -top-44 -right-44 w-[520px] h-[520px] rounded-full border border-gray-300/60" />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border-[6px] border-white/70" />
      <div className="pointer-events-none absolute -top-28 -right-28 w-[430px] h-[430px] rounded-full bg-gray-700/80" />

      {/* NOTE:
          - max-w dibuat lebih longgar
          - padding kiri/kanan dibuat jelas
      */}
      <div className="relative w-full px-8 md:px-12 lg:px-16">
        {/* Brand */}
        <h2 className="pt-8 text-5xl font-extrabold text-gray-700">
          RaniaMart
        </h2>

        {/* LAYOUT UTAMA:
            kiri = maps fixed
            kanan = 3 kolom isi sisa lebar
        */}
        <div className="mt-6 pb-10 flex flex-col md:flex-row md:items-start">
          {/* MAPS - KIRI FIXED */}
          <div className="md:w-[360px] lg:w-[400px] shrink-0">
            <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-lg bg-white">
              <div className="h-64 w-full">
                <iframe
                  title="Lokasi RaniaMart"
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                />
              </div>
              <div className="flex items-center gap-2 p-3 text-sm text-gray-600 border-t">
                <MapPin size={16} />
                <span>Lokasi Rania Mart Surabaya</span>
              </div>
            </div>
          </div>

          {/* GAP BESAR ANTARA MAP DAN KONTEN */}
          <div className="hidden md:block md:w-12 lg:w-16" />

          {/* KONTEN KANAN */}
          {/* padding kanan besar supaya mendekati area lingkaran */}
          <div className="flex-1 mt-10 md:mt-0 pr-0 md:pr-16 lg:pr-40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
              {/* CUSTOMER SERVICES */}
              <div>
                <h3 className="pb-2 text-lg font-bold text-gray-800 border-b-2 border-gray-600 inline-block">
                  Customer Services
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
                  <li>
                    <a
                      className="hover:font-semibold hover:text-gray-900 hover:underline"
                      href="#"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:font-semibold hover:text-gray-900 hover:underline"
                      href="#"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:font-semibold hover:text-gray-900 hover:underline"
                      href="#"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:font-semibold hover:text-gray-900 hover:underline"
                      href="#"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:font-semibold hover:text-gray-900 hover:underline"
                      href="#"
                    >
                      Cancellation &amp; Return Policy
                    </a>
                  </li>
                </ul>
              </div>

              {/* CONTACT US */}
              <div>
                <h3 className="pb-2 text-lg font-bold text-gray-800 border-b-2 border-gray-600 inline-block">
                  Contact Us
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <MessageCircle size={16} className="mt-0.5 text-gray-500" />
                    <div className="leading-tight">
                      <div className="font-medium">Whats App</div>
                      <div className="text-gray-600">+62 801-902-9012</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <PhoneCall size={16} className="mt-0.5 text-gray-500" />
                    <div className="leading-tight">
                      <div className="font-medium">Call Us</div>
                      <div className="text-gray-600">+62 858-808-2312</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* FOLLOW US */}
              <div>
                <h3 className="pb-2 text-lg font-bold text-gray-800 border-b-2 border-gray-600 inline-block">
                  Follow Us
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Instagram size={16} className="mt-0.5 text-gray-500" />
                    <div className="leading-tight">
                      <div className="font-medium">Instagram</div>
                      <div className="text-gray-600">@raniamart</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Music2 size={16} className="mt-0.5 text-gray-500" />
                    <div className="leading-tight">
                      <div className="font-medium">Tiktok</div>
                      <div className="text-gray-600">@raniamart.tiktok</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* end right content */}
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-300/70 py-4 text-center text-sm text-gray-500 bg-[#EAF6FB]">
        © Rania Mart, 2025 All right reserved
      </div>
    </footer>
  );
};

export default Footer;
