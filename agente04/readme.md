# Agente de Organização de Tarefas (ADK + Trello)

Este projeto é um agente construído com **Google ADK (Agent Development Kit)** que se conecta ao **Trello** para organizar tarefas do dia a dia de forma conversacional.

O agente:
- Pergunta quais são as tarefas do dia.
- Cria cards no Trello com **nome**, **descrição** e **data de vencimento**.
- Permite **listar tarefas** por status.
- Permite **mudar o status** de tarefas (A Fazer → Em Andamento → Concluído).
- Permite adicionar tarefas com datas diferentes do dia de hoje

## Tecnologias utilizadas

- Python
- Google ADK (LLM Agent)
- Trello API (`py-trello`)
- dotenv (para gerenciamento de variáveis de ambiente)

## Como funciona a integração com datas

O agente entende comandos como:
- “tarefas **para hoje**”
- “tarefas **para amanhã**”
- “tarefa **para daqui a 7 dias**”

Na função `adicionar_tarefa`, o parâmetro `due_date` recebido do agente é normalizado e convertido para o formato ISO 8601 que o Trello aceita, por exemplo:

```text
2026-04-27T23:59:00.000Z
```
Isso evita erros como `{"message":"invalid date","error":"ERROR"}` na criação dos cards, que era um problema que eu estava tendo ao rodar, pois o 
agente passava a data como "hoje", "amanhã", fazendo com que quando chegasse no Trello desse erro.

## Como executar o projeto

1. Clone este repositório:

```bash
git clone https://github.com/<seu-usuario>/<seu-repo>.git
cd <seu-repo>
```

2. Crie e ative um ambiente virtual (opcional, mas recomendado):

```bash
python -m venv .venv
.venv\Scripts\activate.ps1     # Windows
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Configure o arquivo `.env` com suas credenciais do Trello:

```env
TRELLO_API_KEY=seu_api_key
TRELLO_API_SECRET=seu_api_secret
TRELLO_TOKEN=seu_token
```

5. Inicie o servidor do ADK:

```bash
adk web
```

6. Acesse a interface web indicada no terminal (geralmente `http://127.0.0.1:8000`), selecione o app do agente e comece a conversar.

---

## Próximos passos / melhorias

- Adicionar suporte a datas em formato natural como `27/04/2026`.
- Implementar remoção de tarefas diretamente pelo agente.
- Adicionar testes automatizados para as funções de data e integração com o Trello.
- Utilizar uma LLM mais robusta que não fique sobrecarregada toda hora
- Publicar esse ChatBot para uso
