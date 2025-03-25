import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiWHB0byIsImlhdCI6MTc0MjkxODc1Nn0.';
const { header } = jwt.decode(token, { complete: true });
const alg = header.alg;
const secret = null;
if (alg.startsWith("HS256")) {
  secret = "my-secret";
}
if (alg.startsWith("RS256")) {
  secret = 'my-public-certificado';
}

//não deixe o token determinar qual algoritmo usar para verificar a assinatura
const payload = jwt.verify(token, secret, { algorithms: [alg] });
console.log(payload);

//vulnerabilidade de none attack para aplicações legadas que utilizam bibliotecas mais antigas
// const token = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiWHB0byIsImlhdCI6MTc0MjkxODc1Nn0.';

// const payload = jwt.verify(token)
