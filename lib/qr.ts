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
    color: { dark: "#09090b", light: "#c084fc" },
  });
  cache.set(voteUrl, dataUrl);
  return dataUrl;
}
