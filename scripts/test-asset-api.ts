/**
 * アセットAPI動作確認スクリプト
 * アップロード → 一覧 → アクティブ設定 → 削除の一連の流れをテスト
 *
 * Usage:
 *   bun run scripts/test-asset-api.ts
 *
 * Prerequisites:
 *   - backend dev server running (bun run dev:backend)
 *   - images dev server running (bun run dev:images)
 */

import type { AssetType } from "@repo/types";

const IMAGE_API_URL = process.env.IMAGE_API_URL || "http://localhost:8788";

// テスト用の1x1 PNG画像（Base64）
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function createTestImage(): Promise<Blob> {
  const binary = atob(TEST_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: "image/png" });
}

async function uploadAsset(type: AssetType, filename: string): Promise<string> {
  const blob = await createTestImage();
  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("type", type);

  const response = await fetch(`${IMAGE_API_URL}/api/assets`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data.id;
}

async function getActiveAsset(type: AssetType): Promise<string | null> {
  const response = await fetch(`${IMAGE_API_URL}/api/assets/active/${type}`);
  if (!response.ok) {
    throw new Error(`Get active failed: ${response.status}`);
  }
  const data = await response.json();
  return data.data.asset?.id ?? null;
}

async function setActiveAsset(type: AssetType, assetId: string): Promise<void> {
  const response = await fetch(`${IMAGE_API_URL}/api/assets/${type}/${assetId}/activate`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`Set active failed: ${response.status}`);
  }
}

async function deleteAsset(type: AssetType, assetId: string): Promise<void> {
  const response = await fetch(`${IMAGE_API_URL}/api/assets/${type}/${assetId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

async function listAssets(type?: AssetType): Promise<string[]> {
  const url = type ? `${IMAGE_API_URL}/api/assets?type=${type}` : `${IMAGE_API_URL}/api/assets`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`List failed: ${response.status}`);
  }
  const data = await response.json();
  return data.data.assets.map((a: { id: string }) => a.id);
}

async function runTests() {
  console.log("=== Asset API Test Suite ===\n");
  console.log(`API URL: ${IMAGE_API_URL}\n`);

  const testType: AssetType = "card-back";
  const uploadedIds: string[] = [];

  try {
    // Test 1: Upload
    console.log("1. Testing asset upload...");
    const id1 = await uploadAsset(testType, "test-asset-1.png");
    uploadedIds.push(id1);
    console.log(`   ✅ Uploaded: ${id1}`);

    const id2 = await uploadAsset(testType, "test-asset-2.png");
    uploadedIds.push(id2);
    console.log(`   ✅ Uploaded: ${id2}`);

    // Test 2: List
    console.log("\n2. Testing asset list...");
    const assets = await listAssets(testType);
    console.log(`   ✅ Found ${assets.length} assets`);
    if (!assets.includes(id1) || !assets.includes(id2)) {
      throw new Error("Uploaded assets not found in list");
    }

    // Test 3: Get Active
    console.log("\n3. Testing get active asset...");
    const activeId = await getActiveAsset(testType);
    console.log(`   ✅ Active asset: ${activeId}`);

    // Test 4: Set Active (switch to second asset)
    console.log("\n4. Testing set active...");
    await setActiveAsset(testType, id2);
    const newActiveId = await getActiveAsset(testType);
    if (newActiveId !== id2) {
      throw new Error(`Expected active to be ${id2}, got ${newActiveId}`);
    }
    console.log(`   ✅ Active changed to: ${newActiveId}`);

    // Test 5: Delete
    console.log("\n5. Testing asset deletion...");
    await deleteAsset(testType, id1);
    console.log(`   ✅ Deleted: ${id1}`);

    const remainingAssets = await listAssets(testType);
    if (remainingAssets.includes(id1)) {
      throw new Error("Deleted asset still in list");
    }
    console.log(`   ✅ Verified deletion (${remainingAssets.length} assets remaining)`);

    // Cleanup: delete remaining test asset
    console.log("\n6. Cleanup...");
    await deleteAsset(testType, id2);
    console.log(`   ✅ Deleted: ${id2}`);

    console.log("\n=== All tests passed! ===\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Cleanup on failure
    console.log("\nCleaning up...");
    for (const id of uploadedIds) {
      try {
        await deleteAsset(testType, id);
        console.log(`   Deleted: ${id}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

runTests();
