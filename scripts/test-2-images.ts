import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = "http://localhost:8788";
const PUBLIC_DIR = "./public/assets/cards";

async function testUpload() {
  console.log("Starting test upload (2 images)...\n");

  try {
    const files = await readdir(PUBLIC_DIR);
    const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i)).slice(0, 2);

    console.log(`Uploading ${imageFiles.length} images\n`);

    const formData = new FormData();
    for (const filename of imageFiles) {
      const filepath = join(PUBLIC_DIR, filename);
      const fileBuffer = await readFile(filepath);
      const blob = new Blob([fileBuffer], { type: "image/png" });
      formData.append("files", blob, filename);
      console.log(`Added: ${filename}`);
    }

    console.log(`\nSending bulk upload request...`);
    const response = await fetch(`${IMAGE_API_URL}/api/images/bulk`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Upload failed:", response.status);
      console.error(await response.text());
      process.exit(1);
    }

    const data = await response.json();
    console.log("\nUpload complete!");
    console.log(`Success: ${data.data.successCount}, Failed: ${data.data.failedCount}\n`);

    if (data.data.uploaded.length > 0) {
      console.log("Uploaded images:");
      for (const img of data.data.uploaded) {
        console.log(`  - ${img.originalName}`);
        console.log(`    ID: ${img.id}`);
        console.log(`    HasWebP: ${img.hasWebP}`);
      }
    }

    if (data.data.failed.length > 0) {
      console.log("\nFailed:");
      for (const f of data.data.failed) {
        console.log(`  - ${f.filename}: ${f.error}`);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testUpload();
