/**
 * Шифрование секретов, которые хранятся в базе (ключ ЮKassa и т.п.).
 * Ключ шифрования выводится из AUTH_SECRET — отдельная переменная не нужна,
 * но при смене AUTH_SECRET сохранённые секреты придётся ввести заново.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const SALT = "paul-english.secrets.v1";

function key(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET не задан — нечем шифровать секреты");
  return scryptSync(secret, SALT, 32);
}

/** Шифрует строку. Формат: iv.tag.payload (base64url). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

/** Расшифровывает строку. Возвращает null, если данные повреждены или ключ сменился. */
export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    const [ivB64, tagB64, dataB64] = payload.split(".");
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}

/** Маска для показа в интерфейсе: «••••••••abcd». */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return "";
  const tail = value.slice(-4);
  return "•".repeat(Math.max(8, Math.min(24, value.length - 4))) + tail;
}
