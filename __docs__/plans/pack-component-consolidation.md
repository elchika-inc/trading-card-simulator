# パックコンポーネント統合計画

## 1. 現状分析

### 1.1 コンポーネントの所在と特徴

| コンポーネント | 場所 | Props | 特徴 |
|---|---|---|---|
| **packages/ui/src/pack-visual.tsx** | 共有パッケージ | `frontImageUrl?`, `backImageUrl?`, `packData?`, `isHovered?`, `isSelected?`, `showBack?`, `className?` | 汎用的、画像URLを直接受け取る、サイズ可変 |
| **apps/frontend/src/components/app/pack-select/pack-visual.tsx** | フロントエンド | `type`, `isHovered?`, `isSelected?`, `showBack?` | PACK_TYPESに依存、typeからデータ取得、サイズ固定(w-64 h-96) |

### 1.2 使用箇所の詳細

#### packages/ui/pack-visual を使用している箇所（管理画面系）:
| ファイル | 使用方法 |
|---|---|
| `apps/admin/.../pack-list.tsx` | パック表面・裏面のサムネイル表示 |
| `apps/admin/.../pack-preview-modal.tsx` | パックのフルサイズプレビュー |
| `apps/admin/.../asset-list.tsx` | アセット一覧でのプレビュー |
| `apps/admin/.../asset-preview-modal.tsx` | アセットプレビュー |

#### apps/frontend/pack-visual を使用している箇所（フロントエンド系）:
| ファイル | 使用方法 |
|---|---|
| `apps/frontend/src/pages/pack-list.tsx` | カルーセル選択UI |
| `apps/frontend/src/pages/pack-detail.tsx` | パック詳細表示（回転可能） |

---

## 2. 統合方針

**「汎用性優先」** - `packages/ui/pack-visual.tsx` をベースとし、フロントエンド用にラッパーコンポーネントを作成

### 2.1 ラッパーコンポーネントの設計

```typescript
// apps/frontend/src/components/app/pack-select/pack-visual-wrapper.tsx
import { PackVisual } from "@repo/ui/pack-visual";
import { PACK_TYPES } from "@/data/pack-types";

interface PackVisualWrapperProps {
  type: string;
  isHovered?: boolean;
  isSelected?: boolean;
  showBack?: boolean;
}

export function PackVisualWrapper({ type, ...props }: PackVisualWrapperProps) {
  const packData = PACK_TYPES.find((p) => p.id === type) ?? PACK_TYPES[0];

  return (
    <PackVisual
      frontImageUrl={packData?.image ?? undefined}
      packData={packData ? {
        name: packData.name,
        description: packData.description,
        icon: packData.icon,
        colorFrom: packData.colorFrom,
        colorTo: packData.colorTo,
        accentColor: packData.accentColor,
        rareRate: packData.rareRate,
        subTitle: packData.subTitle,
        contentsInfo: packData.contentsInfo,
        backTitle: packData.backTitle,
        featureTitle: packData.featureTitle,
      } : undefined}
      className="w-64 h-96"
      {...props}
    />
  );
}
```

---

## 3. 移行手順

### Step 1: ラッパーコンポーネント作成
- [x] `apps/frontend/src/components/app/pack-select/pack-visual-wrapper.tsx` を新規作成

### Step 2: フロントエンドの使用箇所を移行
- [x] `apps/frontend/src/pages/pack-list.tsx` のインポート先を変更
- [x] `apps/frontend/src/pages/pack-detail.tsx` のインポート先を変更

### Step 3: 古いコンポーネントの削除
- [x] `apps/frontend/src/components/app/pack-select/pack-visual.tsx` を削除

---

## 4. 変更対象ファイル一覧

### 新規作成
- `apps/frontend/src/components/app/pack-select/pack-visual-wrapper.tsx`

### 修正
- `apps/frontend/src/pages/pack-list.tsx` - インポート先変更
- `apps/frontend/src/pages/pack-detail.tsx` - インポート先変更

### 削除
- `apps/frontend/src/components/app/pack-select/pack-visual.tsx`

### 変更不要
- `packages/ui/src/pack-visual.tsx` - 既に汎用的、そのまま使用
- `apps/admin/*` - 既に @repo/ui を使用
- `apps/frontend/.../pack-opening/pack-idle.tsx` - 開封演出専用、別途維持

---

## 5. 推奨理由

1. **既存コードの変更が最小限** - インポート先の変更のみ
2. **PACK_TYPESとの結合を一箇所に集約** - 保守性向上
3. **将来の変更に強い** - PACK_TYPESの構造変更時もラッパーの修正のみで対応可能
