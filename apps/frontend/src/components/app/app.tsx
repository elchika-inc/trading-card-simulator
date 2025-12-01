import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PackSelect as SamplePackSelect } from "../../../../../sample/pack-select";
import { CardGallery } from "./card-gallery";
import { Landing } from "./landing";
import { PackSelect } from "./pack-select";

/**
 * メインアプリケーションコンポーネント
 */
export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pack-select" element={<PackSelect />} />
        <Route path="/sample/pack-select" element={<SamplePackSelect />} />
        <Route path="/gallery" element={<CardGallery />} />
      </Routes>
    </BrowserRouter>
  );
}
