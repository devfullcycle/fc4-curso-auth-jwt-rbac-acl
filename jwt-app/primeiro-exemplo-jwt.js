const crypto = require("crypto");

const header = {
  alg: "HS256",
  typ: "JWT",
};

const payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
};

const secret = "minha-chave-secreta";

const headerBase64 = base64url(JSON.stringify(header));

const payloadBase64 = base64url(JSON.stringify(payload));

const signature = base64url(
  crypto
    .createHmac("sha256", secret)
    .update(`${headerBase64}.${payloadBase64}`)
    .digest()
);

const token = headerBase64 + "." + payloadBase64 + "." + signature;
console.log(token);

function base64url(source) {
  return Buffer.from(source)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const [headerBase64_, payloadBase64_, signature_] = token.split(".");

const newSignature = base64url(
  crypto
    .createHmac("sha256", secret)
    .update(`${headerBase64_}.${payloadBase64_}`)
    .digest()
);

if (signature_ === newSignature) {
  console.log("Token válido");
} else {
  console.log("Token inválido");
}

