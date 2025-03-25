# Weak HMAC Attack

Ataques de força bruta funcionam em JWT com **HMAC (HS256)**, o **hashcat** é uma das melhores ferramentas. 

Vamos a um exemplo

---

## **1️⃣ O que estamos tentando quebrar?**
Em um JWT **HS256**, a assinatura é feita assim:  

```plaintext
HMAC-SHA256(base64(header) + "." + base64(payload), chave_secreta)
```

Se a chave secreta for **fraca** (como "123456" ou "secret"), podemos tentar quebrá-la com um ataque de força bruta.  

---

## **2️⃣ Passo a passo para usar o Hashcat**  

### **📌 Passo 1: Instalar o Hashcat**  
Se ainda não tem o **hashcat**, instale:  

🔹 **Linux:**  
```bash
sudo apt install hashcat
```

🔹 **Mac (Homebrew):**  
```bash
brew install hashcat
```

🔹 **Windows:**  
Baixe do site oficial: [https://hashcat.net/hashcat/](https://hashcat.net/hashcat/)  

---

### **📌 Passo 2: Gerar um JWT alvo**  
Vamos criar um **JWT assinado com a chave "secret"** para testar:  

```bash
echo -n '{"alg":"HS256","typ":"JWT"}.{"sub":"admin"}' | openssl dgst -sha256 -hmac "secret" -binary | base64
```

Isso gera a assinatura HMAC e podemos montar um JWT falso para tentar quebrar:  

```plaintext
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiJ9.<assinatura>
```

---

### **📌 Passo 3: Rodar o Hashcat para descobrir a chave secreta**  
Agora usamos o **modo 16500**, que é específico para JWT HMAC-SHA256:  

```bash
hashcat -a 0 -m 16500 jwt_hash.txt wordlist.txt --force
```

🔹 **`-a 0`** → Modo do ataque. Indica que será um *brutal force*. O comando tentará todas as combinações possíveis.

🔹 **`-m 16500`** → Modo JWT HMAC-SHA256  

🔹 **`jwt_hash.txt`** → Arquivo com o JWT alvo  

🔹 **`wordlist.txt`** → Lista de palavras comuns para testar como chaves  

Se a chave estiver na lista, o hashcat vai quebrá-la rapidamente.  

## Como se proteger?

**Use chaves fortes:** Chaves longas e aleatórias são mais difíceis de quebrar. As chaves devem ter pelo menos 256 bits de entropia, porque o HMAC-SHA256 é um algoritmo de 256 bits.
Ela precisa ser o mais aleatória possível, você pode usar o comando abaixo como exemplo:

```
openssl rand -base64 64
```

Este comando gerará uma string de 64 bytes, ou seja, 512 bits, que é uma chave forte para o HMAC-SHA256.

---