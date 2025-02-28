# Registered Claims

As registered claims são um conjunto de campos padronizados que podem ser usados para transmitir informações comuns entre sistemas que utilizam JWT.

Abaixo estão listados os campos registrados mais comuns, que podem ser usados para garantir a integridade e segurança dos tokens JWT.

| Abreviação | Nome Completo         | Tipo do Dado  | Motivo de Uso |
|------------|----------------------|--------------|--------------|
| `iss`      | Issuer               | String       | Garante autenticidade ao identificar quem emitiu o token. Permite que o receptor valide se o token veio de uma fonte confiável. |
| `sub`      | Subject              | String       | Define para quem o token foi emitido. Essencial para associar o token a um usuário ou entidade específica. |
| `aud`      | Audience             | String/Array | Restringe o uso do token a sistemas específicos, evitando que um token válido para um serviço seja aceito por outro indevidamente. |
| `exp`      | Expiration Time      | Integer      | Previne reutilização de tokens antigos e reduz riscos de sequestro de sessão. Define um tempo máximo de validade do token. |
| `nbf`      | Not Before           | Integer      | Impede o uso do token antes de uma determinada data/hora, útil para controle de acesso programado ou revogações temporárias. |
| `iat`      | Issued At            | Integer      | Permite que sistemas determinem a idade do token, útil para verificar se um token ainda é válido dentro de uma janela de tempo aceitável. |
| `jti`      | JWT ID               | String       | Garante unicidade ao token, ajudando a prevenir ataques de replay ao armazenar e validar tokens já usados. |
