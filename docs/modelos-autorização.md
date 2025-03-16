# Modelos de Autorização: RBAC, ACL, ABAC, DAC e MAC

A autorização em sistemas de informação é um aspecto essencial da segurança, garantindo que apenas usuários autorizados possam acessar determinados recursos. Os principais modelos de autorização são RBAC, ACL, ABAC, DAC e MAC. A seguir, exploramos cada um deles em detalhes.

---

## 1. RBAC (Role-Based Access Control) - Controle de Acesso Baseado em Papéis

### O que é?
O controle de acesso baseado em função (RBAC) é um método para controlar o que os usuários podem fazer nos sistemas de TI de uma empresa. O RBAC faz isso atribuindo uma ou mais "funções" a cada usuário e concedendo permissões diferentes a cada função. O RBAC pode ser aplicado em um único aplicativo de software ou em vários aplicativos.

### Como funciona?
Os administradores definem papéis (como "Administrador", "Usuário", "Gerente") e associam permissões a esses papéis. Os usuários recebem papéis específicos, herdando as permissões correspondentes.

### Componentes:
- **Usuários**: Pessoas ou entidades que acessam o sistema.
- **Papéis**: Conjunto de permissões atribuídas a um grupo.
- **Permissões**: Ações permitidas para cada papel.

### Exemplo prático:
Um sistema de RH pode definir:
- **Admin**: Tem acesso irrestrito a todos os recursos.
- **Gerente**: Pode visualizar e editar perfis de funcionários.
- **Funcionário**: Pode visualizar seu próprio perfil, mas não editar.

---

## 2. ACL (Access Control List) - Lista de Controle de Acesso

### O que é?
ACL é um modelo baseado em listas que definem quais usuários ou grupos podem acessar um recurso e quais ações podem realizar. Este modelo é amplamente utilizado em sistemas de arquivos e serviços de armazenamento, como o Amazon S3.

### Como funciona?
Cada recurso tem uma lista associada que especifica permissões individuais para usuários ou grupos.

### Componentes:
- **Sujeito**: Usuário ou grupo tentando acessar um recurso.
- **Objeto**: O recurso protegido (arquivo, banco de dados, API).
- **Permissões**: Definição de ações permitidas (ler, escrever, executar).

### Exemplo prático:
Em um servidor de arquivos:
```
Arquivo: Relatorio.doc
- Alice: leitura e escrita
- Bob: apenas leitura
- Carol: sem acesso
```

### Exemplo prático no Amazon S3:
No Amazon S3, você pode definir uma ACL para um bucket ou objeto:
```
Bucket: meu-bucket
- Usuário: alice@example.com
  Permissões: leitura e escrita
- Usuário: bob@example.com
  Permissões: apenas leitura
- Grupo: todos
  Permissões: sem acesso
```

### Exemplo prático com objeto específico:
Em um sistema de gerenciamento de documentos:
```
Documento: ProjetoX.doc
- Usuário: joao@example.com
  Permissões: leitura e escrita
- Usuário: maria@example.com
  Permissões: apenas leitura
- Grupo: equipe_projetoX
  Permissões: leitura e escrita
```

---

## 3. ABAC (Attribute-Based Access Control) - Controle Baseado em Atributos

### O que é?
ABAC é um modelo dinâmico que usa atributos (ou características) em vez de cargos para conceder permissões. O objetivo do ABAC é proteger objetos, como dados, dispositivos de rede e recursos de TI, de usuários e ações não autorizados—aqueles que não possuem características "aprovadas" conforme definido pelas políticas de segurança de uma organização.

### Como funciona?
As permissões são concedidas com base em um conjunto de regras definidas por atributos do usuário, do recurso e do contexto.

### Componentes:
- **Sujeitos**: Usuários ou entidades tentando acessar o sistema.
- **Recurso**: O objeto protegido.
- **Ação**: A operação que o sujeito deseja realizar no recurso.
- **Ambiente**: O contexto no qual o acesso é solicitado (horário, localização, etc.).

### Exemplo prático:
Uma regra pode especificar:
- **Médicos** podem acessar prontuários apenas **durante o expediente**.
- Se o usuário estiver **fora do hospital**, o acesso é bloqueado.

Outro exemplo:
- **Gerentes** podem aprovar despesas **acima de $1000** apenas **se estiverem no escritório**.
- **Funcionários** podem visualizar relatórios financeiros **apenas durante o horário comercial** e **se estiverem conectados à rede corporativa**.

Mais exemplos:
- **Gerentes de hospital** podem gerenciar recursos apenas **dentro do seu próprio hospital**.
- **Gerentes regionais** podem gerenciar recursos **em todos os hospitais da região**.
- **Gerentes globais** podem gerenciar recursos **em todos os hospitais**.

### Exemplo prático detalhado:
- **Sujeito**: Dr. João (Médico)
- **Recurso**: Prontuário do paciente
- **Ação**: Leitura
- **Ambiente**: Dentro do hospital e durante o expediente

Regra: Dr. João pode acessar o prontuário do paciente apenas se ele estiver dentro do hospital e durante o horário de expediente.

Outro exemplo detalhado:
- **Sujeito**: Maria (Gerente de hospital)
- **Recurso**: Recursos do hospital
- **Ação**: Gerenciamento
- **Ambiente**: Dentro do hospital que ela gerencia

Regra: Maria pode gerenciar os recursos apenas dentro do hospital que ela gerencia.

Mais um exemplo detalhado:
- **Sujeito**: Carlos (Gerente regional)
- **Recurso**: Recursos dos hospitais da região
- **Ação**: Gerenciamento
- **Ambiente**: Dentro de qualquer hospital da região

Regra: Carlos pode gerenciar os recursos em todos os hospitais da região.

E um último exemplo:
- **Sujeito**: Ana (Gerente global)
- **Recurso**: Recursos de todos os hospitais
- **Ação**: Gerenciamento
- **Ambiente**: Em qualquer hospital

Regra: Ana pode gerenciar os recursos em todos os hospitais.

---

## 4. DAC (Discretionary Access Control) - Controle de Acesso Discricionário

### O que é?
O Controle de Acesso Discricionário (DAC) é um modelo de controle de acesso onde o proprietário do recurso tem a capacidade de determinar quem pode acessar o recurso e quais operações podem ser realizadas. Este modelo é baseado na discrição do proprietário do recurso e utiliza listas de controle de acesso (ACL) para definir permissões.

### Como funciona?
No DAC, o proprietário do recurso (usuário que criou o recurso) define uma lista de controle de acesso (ACL) que especifica quais usuários ou grupos têm permissão para acessar o recurso e quais operações (ler, escrever, executar) podem ser realizadas.

### Componentes:
- **Usuário**: Dono do recurso.
- **Recurso**: O objeto protegido.
- **Permissões**: Concedidas diretamente pelo dono do recurso.

### Exemplo prático:
No Windows, Alice pode criar um documento e conceder permissão para Bob editá-lo, mas não para Carol. Alice, como proprietária do documento, tem total controle sobre quem pode acessá-lo e quais operações podem ser realizadas.

---

## 5. MAC (Mandatory Access Control) - Controle de Acesso Obrigatório

### O que é?
O Controle de Acesso Obrigatório (MAC) é um modelo de controle de acesso onde o sistema, e não os proprietários dos recursos, controla o acesso aos recursos com base em classificações de segurança. Este modelo é frequentemente utilizado em ambientes onde a segurança é crítica, como em organizações governamentais e militares.

### Como funciona?
No MAC, os objetos (recursos) são etiquetados com rótulos de segurança (como Confidencial, Secreto, Ultra Secreto) e os usuários são atribuídos a níveis de segurança. O sistema permite ou nega o acesso com base na comparação entre o rótulo de segurança do objeto e a credencial de segurança do usuário. Este modelo também utiliza listas de controle de acesso (ACL) para definir permissões.

### Componentes:
- **Objetos**: Recursos com classificação de segurança.
- **Sujeitos**: Usuários com credenciais de segurança.
- **Políticas de Acesso**: Definem regras baseadas em classificação.

### Exemplo prático:
Em um sistema militar:
- Um usuário com credencial "Confidencial" pode acessar documentos "Confidenciais", mas não "Secretos".
- Apenas usuários de alta patente podem acessar documentos "Ultra Secreto".

---

## Comparando os Modelos

| Modelo | Baseado em | Vantagens | Desvantagens |
|--------|-----------|-----------|--------------|
| **RBAC** | Papéis | Fácil de gerenciar, usado amplamente | Pode ser inflexível |
| **ACL** | Lista de permissões | Controle granular | Difícil de gerenciar em larga escala |
| **ABAC** | Atributos | Muito flexível, dinâmico | Complexidade alta |
| **DAC** | Proprietário do recurso | Simples e flexível | Menos seguro |
| **MAC** | Níveis de segurança | Altamente seguro | Pouco flexível, difícil de administrar |

---

## Conclusão
Cada modelo de autorização tem suas vantagens e é mais adequado para determinados cenários. **RBAC** e **ACL** são comuns em empresas, enquanto **ABAC** oferece maior flexibilidade. **DAC** é ideal para ambientes menos restritivos, enquanto **MAC** é usado em ambientes de alta segurança.

Escolher o modelo certo depende do equilíbrio entre segurança e facilidade de gerenciamento. 🚀