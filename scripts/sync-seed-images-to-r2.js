import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { loadLocalEnv, requireEnv } from "../lib/environment.js";
import { SEED_MEALS } from "../lib/seed-data.js";

const imageFiles = SEED_MEALS.map((m) => m.imageFileName);

const contentTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

async function uploadSeedImages() {
  loadLocalEnv();

  const bucket = requireEnv("R2_BUCKET_NAME");
  const imageDir = path.join(process.cwd(), "assets");

  const r2 = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  for (const fileName of imageFiles) {
    const filePath = path.join(imageDir, fileName);
    const key = `seed/${fileName}`;

    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping missing file: ${filePath}`);
      continue;
    }

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.readFileSync(filePath),
        ContentType: contentTypes[path.extname(fileName).toLowerCase()],
      }),
    );

    console.log(`Uploaded ${key}`);
  }

  console.log("All seed images uploaded to R2.");
}

uploadSeedImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
