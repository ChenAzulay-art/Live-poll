import QRCode from "qrcode";

const cache = new Map<string, string>();

export async function voteQrDataUrl(voteUrl: string) {
  const cached = cache.get(voteUrl);
  if (cached) {
    return cached;
  }
  const dataUrl = await QRCode.toDataURL(voteUrl, {
    margin: 1,
    width: 220,
    color: { dark: "#0a0a0a", light: "#d6ff2a" },
  });
  cache.set(voteUrl, dataUrl);
  return dataUrl;
}
