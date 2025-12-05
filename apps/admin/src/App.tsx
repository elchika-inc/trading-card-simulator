import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AssetsPage } from "./pages/assets";
import { CardsPage } from "./pages/cards";
import { GachaManagementPage } from "./pages/gacha-management";
import { MenuPage } from "./pages/menu";
import { NewsPage } from "./pages/news";
import { SettingsPage } from "./pages/settings";

/**
 * Admin アプリケーション
 * ルーティング構成
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/gacha" element={<GachaManagementPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
