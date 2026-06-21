import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

export function generateTotpSecret() {
  return generateSecret();
}

export function verifyTotp(secret: string, token: string) {
  return verifySync({ secret, token: token.replace(/\s+/g, ""), epochTolerance: 30 }).valid;
}

export async function makeTotpQr(email: string, secret: string) {
  const otpauth = generateURI({
    issuer: "ManJyun Blog",
    label: email,
    secret
  });
  return {
    otpauth,
    qrDataUrl: await QRCode.toDataURL(otpauth)
  };
}
