import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserProvider } from "@/contexts/user-context";
import { CardDetail, PackDetail, PackList, PackOpeningPage } from "@/pages";
import { CardGallery } from "./card-gallery";
import { Landing } from "./landing";

/** サンプル用のデフォルトパックID */
const DEFAULT_SAMPLE_PACK_ID = "dragon-flame";

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

          {/* サンプルルート */}
          <Route path="/sample/gallery-sample" element={<CardGallery />} />
          <Route
            path="/sample/pack-open-sample"
            element={
              <Navigate to={`/packs/${DEFAULT_SAMPLE_PACK_ID}/open`} replace />
            }
          />
          <Route path="/sample/pack-select" element={<PackList />} />
          <Route path="/sample/top-page-sample" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
