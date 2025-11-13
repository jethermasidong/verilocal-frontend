"use client";

import axios from "axios";
import { useRef, useState } from "react";

export default function ProductScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState(null);

  const Html5QrcodeRef = useRef(null);

  const startScanner = async () => {
    setError(null);
    setProduct(null);
    setQrData(null);
    setProductDetails(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      Html5QrcodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            setQrData(decodedText);
            if (Html5QrcodeRef.current) await Html5QrcodeRef.current.stop();
            setIsScanning(false);

            const [product_id_str, blockchain_hash] = decodedText.split("|");
            const product_id = Number(product_id_str);

            if (!product_id || !blockchain_hash)
              throw new Error("Invalid QR data format");

            let res;
            try {
              res = await axios.post(
                "http://localhost:3000/api/products/verify",
                { product_id, blockchain_hash }
              );
              setProduct(res.data);
              setError(null);
            } catch (axiosErr) {
              setError(
                axiosErr.response?.data?.message ||
                  "Verification failed. Please try again."
              );
              return;
            }

            if (res.data.verified) {
              try {
                const allRes = await axios.get(
                  "http://localhost:3000/api/products"
                );
                const matched = allRes.data.find((p) => p.id === product_id);
                if (matched) setProductDetails(matched);
                else setError("Verified but product not found in list");
              } catch {
                setError("Verified but failed to fetch product details");
              }
            }
          } catch (err) {
            setError(err.message || "Invalid QR or backend error");
          }
        },
        (scanError) => console.warn("Scan error:", scanError)
      );
    } catch (err) {
      setError("Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (Html5QrcodeRef.current) {
      await Html5QrcodeRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-200">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">
          Product Verification
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Scan the QR code to confirm authenticity
        </p>

        {/* Scanner Box */}
        <div
          id="qr-reader"
          className="relative mx-auto w-72 h-72 rounded-xl overflow-hidden shadow-inner border-4 border-dashed border-gray-300"
          style={{ backgroundColor: "#f9fafb" }}
        >
          {/* Overlay frame */}
          <div className="absolute inset-0 border-4 border-indigo-400 rounded-xl pointer-events-none animate-pulse"></div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-transform transform hover:scale-105"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-transform transform hover:scale-105"
            >
              Stop
            </button>
          )}
        </div>

        {/* Results */}
        {qrData && (
          <p className="mt-6 text-center text-gray-700 break-words font-medium">
            <span className="font-semibold text-gray-900">Scanned:</span>{" "}
            {qrData}
          </p>
        )}

        {/* Feedback */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center shadow-sm">
            ❌ {error}
          </div>
        )}
        {product && product.verified && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-center shadow-sm">
            ✅ {product.message}
          </div>
        )}
        {product && !product.verified && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-center shadow-sm">
            ⚠️ {product.message}
          </div>
        )}

        {/* Product Details */}
        {productDetails && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 mt-8 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {productDetails.name}
            </h3>
            <div className="text-gray-700 space-y-1">
              <p>
                <strong>Description:</strong> {productDetails.description}
              </p>
              <p>
                <strong>Type:</strong> {productDetails.type}
              </p>
              <p>
                <strong>Origin:</strong> {productDetails.origin}
              </p>
              <p>
                <strong>Materials:</strong> {productDetails.materials}
              </p>
              <p>
                <strong>Production Date:</strong>{" "}
                {productDetails.productionDate}
              </p>
            </div>
            {productDetails.product_image && (
              <div className="mt-4 flex justify-center">
                <img
                  src={`http://localhost:3000/${productDetails.product_image}`}
                  alt={productDetails.name}
                  className="rounded-xl shadow-md max-h-60 object-contain border border-gray-100"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
