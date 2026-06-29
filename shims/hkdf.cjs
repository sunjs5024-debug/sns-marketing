// @panva/hkdf 대체 shim (CJS) — Cloudflare Workers(엣지)용.
// next-auth v4(CJS) 는 require("@panva/hkdf").default 형태로 호출하므로
// module.exports 와 .default 둘 다 함수로 노출한다. Web Crypto 로 HKDF 구현.
//   원본 API: hkdf(digest, ikm, salt, info, keylen) -> Promise<Uint8Array>

function toBytes(input) {
  if (input == null) return new Uint8Array(0);
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  return new Uint8Array(input);
}

function hashName(digest) {
  const d = String(digest).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (d === "sha256") return "SHA-256";
  if (d === "sha384") return "SHA-384";
  if (d === "sha512") return "SHA-512";
  if (d === "sha1") return "SHA-1";
  throw new TypeError(`unsupported digest: ${digest}`);
}

async function hkdf(digest, ikm, salt, info, keylen) {
  const hash = hashName(digest);
  const key = await crypto.subtle.importKey("raw", toBytes(ikm), "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash, salt: toBytes(salt), info: toBytes(info) },
    key,
    keylen * 8,
  );
  return new Uint8Array(bits);
}

module.exports = hkdf;
module.exports.default = hkdf;
module.exports.hkdf = hkdf;
