# Cookies

## Opções de Cookies

A tabela abaixo apresenta as principais opções de cookies, o que são, suas funções e os motivos para utilizá-las:

| Opção | O que é | Função | Motivos para uso |
|-------|---------|--------|-----------------|
| `Domain` | Define o domínio para o qual o cookie é válido | Restringe quais domínios podem acessar o cookie | Segurança e prevenção de acesso não autorizado entre domínios diferentes |
| `Path` | Define o caminho específico no domínio onde o cookie é válido | Limita o escopo do cookie a caminhos específicos | Restringir acesso do cookie apenas às partes necessárias da aplicação |
| `Expires` | Define uma data de expiração específica para o cookie | Determina quando o cookie se torna inválido | Controlar o tempo de vida de sessões e limitar o período de validade de dados sensíveis |
| `Max-Age` | Define o tempo de vida do cookie em segundos | Similar ao Expires, mas mais preciso com base em segundos | Melhor controle sobre o tempo exato de expiração |
| `Secure` | Flag que restringe o cookie para conexões HTTPS | Impede envio do cookie em conexões não criptografadas | Proteger dados sensíveis contra interceptação em redes não seguras |
| `HttpOnly` | Flag que impede acesso ao cookie via JavaScript | Bloqueia acesso ao cookie pelo código no navegador | Proteger contra ataques XSS (Cross-Site Scripting) |
| `SameSite` | Controla quando cookies são enviados com requisições cross-site | Previne requisições cross-site não autorizadas | Mitigar ataques CSRF (Cross-Site Request Forgery) |

### Valores possíveis para SameSite

| Valor | Comportamento |
|-------|--------------|
| `Strict` | Cookies só são enviados em contexto de mesmo site |
| `Lax` | Cookies são enviados em navegação de nível superior e em contexto de mesmo site, mas não são enviados em requisições cross-site iniciadas por terceiros, exceto para requisições GET de navegação de nível superior. |
| `None` | Cookies são enviados em todos os contextos (requer a flag Secure) |

## Importância na Autenticação JWT

Cookies são frequentemente utilizados para armazenar tokens JWT, oferecendo vantagens como:

1. **Segurança melhorada**: Com flags HttpOnly e Secure, protegem tokens contra acesso não autorizado
2. **Gerenciamento automático**: Navegadores gerenciam cookies automaticamente, simplificando a implementação
3. **Controle de expiração**: Facilitam a configuração de políticas de expiração
4. **Mitigação de ataques XSS e CSRF**: Com as configurações adequadas, minimizam riscos de segurança comuns
