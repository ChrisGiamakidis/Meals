import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import environment from "./environment";
const { loadLocalEnv, requireEnv } = environment;
loadLocalEnv();

const r2 = new S3Client({
  region: "auto",
  endpoint: requireEnv("R2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

export async function uploadMealImage(file, key) {
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );
  
  return `${requireEnv("R2_PUBLIC_URL")}/${key}`;
}

export async function deleteMealImage(imageUrl) {
  const url = new URL(imageUrl);
  const key = url.pathname.slice(1);

  if (key.startsWith("seed/")) {
    return false;
  }

  await r2.send(
    new DeleteObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
    }),
  );

  return true;
}
