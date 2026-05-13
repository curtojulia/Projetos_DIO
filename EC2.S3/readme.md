# Fluxos Arquiteturais na AWS – S3 com Lambda e EC2 com EBS

Este repositório contém dois fluxogramas simples ilustrando arquiteturas básicas na AWS, criadas para um projeto do curso de AWS na DIO.

---

## 1. Fluxo: Amazon S3 + AWS Lambda

**Arquivo da imagem:** `S3awsdrawio.png` 

### Descrição

Este diagrama mostra um cenário **serverless** onde arquivos enviados por um usuário são armazenados no **Amazon S3** e processados automaticamente por uma **função AWS Lambda**.

### Passos do fluxo

1. **Usuário (fora da AWS)**  
   - Envia um arquivo (upload) a partir de um navegador ou aplicação.

2. **Amazon S3 (dentro da AWS)**  
   - O arquivo é recebido e armazenado em um **bucket S3** de entrada.

3. **Evento do S3 → AWS Lambda**  
   - A criação de um novo objeto no bucket dispara um **evento**.
   - Esse evento aciona uma **função Lambda** configurada para esse bucket.

4. **AWS Lambda (processamento serverless)**  
   - A função Lambda lê o arquivo do S3.
   - Realiza o processamento necessário (ex.: redimensionar imagem, converter formato, validar dados).

## 2. Fluxo: Amazon EC2 + Amazon EBS

**Arquivo da imagem:** `EC2awsdrawio.png`

### Descrição

Este diagrama apresenta uma arquitetura mais tradicional, usando uma **instância EC2** como servidor de aplicação e um **volume EBS** como o “disco” dessa instância para armazenar dados.

### Passos do fluxo

1. **Usuário (fora da AWS)**  
   - Acessa a aplicação via navegador ou cliente HTTP.

2. **Requisição HTTP/HTTPS (entrada na AWS)**  
   - A requisição chega ao endereço público (IP ou DNS) da instância **EC2**.

3. **Amazon EC2 (servidor da aplicação – dentro da AWS)**  
   - A EC2 roda a aplicação (por exemplo, um servidor web).
   - Processa a requisição do usuário.

4. **Amazon EBS (armazenamento em bloco)**  
   - A instância EC2 está conectada a um volume **EBS**, que funciona como o HD/SSD da máquina.
   - A aplicação lê e grava dados nesse volume (arquivos, banco de dados, logs etc.).

5. **Resposta ao usuário**  
   - A EC2 envia a resposta (HTML, JSON, etc.) de volta para o usuário, finalizando o fluxo.
