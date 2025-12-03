import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AssetsPage } from "./pages/assets";
import { CardsPage } from "./pages/cards";
import { ImagesPage } from "./pages/images";
import { MenuPage } from "./pages/menu";

/**
 * Admin アプリケーション
 * ルーティング構成
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/images" element={<ImagesPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
