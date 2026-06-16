import sharp from "sharp";
import { randomUUID } from "crypto";
import {
  objectStorageClient,
  ObjectStorageService,
} from "./replit_integrations/object_storage/objectStorage";
import { setObjectAclPolicy } from "./replit_integrations/object_storage/objectAcl";

const objectStorageService = new ObjectStorageService();

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return { bucketName, objectName };
}

export interface OptimizedUpload {
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Optimize an image buffer (resize + convert to WebP) and store it in
 * object storage with public read access. Returns the public object path
 * served via the /objects/ route.
 */
export async function optimizeAndUpload(
  buffer: Buffer,
  options: { maxWidth?: number; quality?: number } = {},
): Promise<OptimizedUpload> {
  const { maxWidth = 1920, quality = 80 } = options;

  const pipeline = sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality });

  const optimized = await pipeline.toBuffer({ resolveWithObject: true });
  const { data, info } = optimized;

  const privateObjectDir = objectStorageService.getPrivateObjectDir();
  const objectId = randomUUID();
  const fullPath = `${privateObjectDir.replace(/\/$/, "")}/uploads/${objectId}.webp`;
  const { bucketName, objectName } = parseObjectPath(fullPath);

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(data, {
    metadata: {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  await setObjectAclPolicy(file, {
    owner: "system",
    visibility: "public",
  });

  return {
    url: `/objects/uploads/${objectId}.webp`,
    width: info.width,
    height: info.height,
    size: data.length,
    mimeType: "image/webp",
  };
}
