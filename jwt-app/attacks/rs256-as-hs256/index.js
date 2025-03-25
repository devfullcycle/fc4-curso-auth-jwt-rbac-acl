import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
//rs256 ===> hs256
const token = jwt.sign({name: 'Xpto'}, process.env.JWT_PRIVATE_KEY, {algorithm: 'RS256'});
//publico - 

console.log("rs256 token", token);

const hs256token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiWHB0byIsImlhdCI6MTc0MjkxODMyNX0.653uznLbe_jA0MPU9ozXInJbUxw5TGOolGH6HlVsfmo';


//não deixe o token determinar qual algoritmo usar para verificar a assinatura
const payload = jwt.verify(hs256token, process.env.JWT_PUBLIC_KEY);

// console.log(payload);
//const [header, payload] = token.split('.').slice(0, 2);

