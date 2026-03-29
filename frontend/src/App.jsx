// src/App.jsx — Root router (search → dashboard → detail)

import { useState } from "react";
import SearchPage from "./pages/SearchPage";
import DashboardPage from "./pages/DashboardPage";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  // "search" | "dashboard" | "detail"
  const [page, setPage] = useState("search");
  const [brandData, setBrandData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleSearch = (brands) => {
    setBrandData(brands);
    setPage("dashboard");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSelectProduct = (product, brandName) => {
    setSelectedProduct(product);
    setSelectedBrand(brandName);
    setPage("detail");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // From detail → back to dashboard (keep same brand data)
  const handleBackToDashboard = () => {
    setPage("dashboard");
    setSelectedProduct(null);
    setSelectedBrand(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // From dashboard → back to search
  const handleBackToSearch = () => {
    setPage("search");
    setBrandData([]);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (page === "detail" && selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        brandName={selectedBrand}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <DashboardPage
        brands={brandData}
        onSelectProduct={handleSelectProduct}
        onBack={handleBackToSearch}
      />
    );
  }

  return <SearchPage onSearch={handleSearch} />;
}
