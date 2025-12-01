import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/user-context";
import { CardDetail, PackDetail, PackList, PackOpeningPage } from "@/pages";
import { CardGallery } from "./card-gallery";
import { Landing } from "./landing";

/**
 * メインアプリケーションコンポーネント
 */
export function App() {
  return (
    <UserProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* ランディング */}
          <Route path="/" element={<Landing />} />

          {/* パック関連 */}
          <Route path="/packs" element={<PackList />} />
          <Route path="/packs/:packId" element={<PackDetail />} />
          <Route path="/packs/:packId/open" element={<PackOpeningPage />} />

          {/* カード関連 */}
          <Route path="/gallery" element={<CardGallery />} />
          <Route path="/cards/:cardId" element={<CardDetail />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
