from google.adk.agents.llm_agent import Agent
from trello import TrelloClient
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import os

load_dotenv()

API_KEY = os.getenv('TRELLO_API_KEY')
API_SECRET = os.getenv('TRELLO_API_SECRET')
TOKEN = os.getenv('TRELLO_TOKEN')


def get_temporal_context():
    now = datetime.now(timezone.utc)
    return now.strftime('%Y-%m-%dT%H:%M:%S.000Z')


def adicionar_tarefa(nome_da_task: str, descricao_da_task: str, due_date: str):
    agora_utc = datetime.now(timezone.utc)

    # Garante que due_date nunca seja None ou vazio
    if not due_date:
        due_date = "hoje"

    due_date_lower = due_date.lower().strip()

    if due_date_lower in ["hoje", "today"]:
        data_final = agora_utc.replace(hour=23, minute=59, second=0, microsecond=0)

    elif due_date_lower in ["amanhã", "amanha", "tomorrow"]:
        data_final = (agora_utc + timedelta(days=1)).replace(
            hour=23, minute=59, second=0, microsecond=0
        )

    elif due_date_lower.lstrip('-').isdigit():
        dias = int(due_date_lower)
        data_final = (agora_utc + timedelta(days=dias)).replace(
            hour=23, minute=59, second=0, microsecond=0
        )

    else:
        try:
            data_final = datetime.fromisoformat(
                due_date.replace("Z", "+00:00")
            ).astimezone(timezone.utc)
        except ValueError:
            data_final = agora_utc.replace(hour=23, minute=59, second=0, microsecond=0)

    # due_formatado sempre definido aqui, independente do caminho acima
    due_formatado = data_final.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    print(f"DEBUG - due_date recebido: '{due_date}' → convertido: '{due_formatado}'")

    client = TrelloClient(
        api_key=API_KEY,
        api_secret=API_SECRET,
        token=TOKEN
    )

    boards = client.list_boards()
    meu_board = [b for b in boards if b.name == 'DIO'][0]
    listas = meu_board.list_lists()
    minha_lista = [
        l for l in listas
        if l.name.upper() == 'TO DO' or l.name.upper() == 'A FAZER'
    ][0]

    minha_lista.add_card(
        name=nome_da_task,
        desc=descricao_da_task,
        due=due_formatado
    )

    return f"✅ Tarefa '{nome_da_task}' criada com vencimento em {due_formatado}"


def listar_tarefas(status: str = "todas"):
    client = TrelloClient(
        api_key=API_KEY,
        api_secret=API_SECRET,
        token=TOKEN
    )

    boards = client.list_boards()
    meu_board = [b for b in boards if b.name == 'DIO'][0]
    listas = meu_board.list_lists()

    if status.lower() == "todas":
        listas_filtradas = listas
    elif status.lower() == "a fazer":
        listas_filtradas = [l for l in listas if l.name.upper() in ['A FAZER', 'TO DO', 'TODO']]
    elif status.lower() == "em andamento":
        listas_filtradas = [l for l in listas if l.name.upper() in ['EM ANDAMENTO', 'DOING']]
    elif status.lower() == "concluido":
        listas_filtradas = [l for l in listas if l.name.upper() in ['CONCLUÍDO', 'CONCLUIDO', 'DONE']]
    else:
        listas_filtradas = listas

    tarefas = []
    for lista in listas_filtradas:
        cards = lista.list_cards()
        for card in cards:
            tarefas.append({
                "nome": card.name,
                "descricao": card.desc,
                "vencimento": card.due,
                "status": lista.name,
                "id": card.id
            })

    return tarefas


def mudar_status_tarefa(nome_da_task: str, novo_status: str) -> str:
    try:
        client = TrelloClient(
            api_key=API_KEY,
            api_secret=API_SECRET,
            token=TOKEN
        )

        boards = client.list_boards()
        meu_board = [b for b in boards if b.name == 'DIO'][0]
        listas = meu_board.list_lists()

        status_map = {
            "a fazer": "A FAZER",
            "em andamento": "EM ANDAMENTO",
            "concluido": "CONCLUÍDO"
        }

        nome_lista_destino = status_map.get(novo_status.lower())

        if not nome_lista_destino:
            return "❌ Status inválido. Use: 'a fazer', 'em andamento' ou 'concluido'"

        lista_destino = next(
            (l for l in listas if l.name.upper() == nome_lista_destino.upper()),
            None
        )

        if not lista_destino:
            return f"❌ Lista '{nome_lista_destino}' não encontrada no board"

        card_encontrado = None
        lista_origem = None

        for lista in listas:
            cards = lista.list_cards()
            card_encontrado = next(
                (c for c in cards if c.name.lower() == nome_da_task.lower()),
                None
            )
            if card_encontrado:
                lista_origem = lista
                break

        if not card_encontrado:
            return f"❌ Card '{nome_da_task}' não encontrado"

        card_encontrado.change_list(lista_destino.id)
        return f"✅ '{nome_da_task}': {lista_origem.name} → {lista_destino.name}"

    except Exception as e:
        return f"❌ Erro: {str(e)}"


root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='Agente de Organização de Tarefas',
    instruction="""
        Você é um agente de organização de tarefas.
        Sua função é receber uma tarefa e criar um card no Trello com o nome e descrição da tarefa.
        Você deve me perguntar as atividades que tenho no dia e criar um card para cada uma delas.
        Você inicia a conversa assim que for ativado, perguntando quais são as tarefas do dia.
        Sempre inicie a conversa perguntando quais são as tarefas do dia informando a data pela tool get_temporal_context,
        e depois vá perguntando se tem mais alguma tarefa, até que o usuário diga que não tem mais tarefas.

        Suas funções:
        1. Adicionar novas tarefas com nome e descrição
        2. Listar todas as tarefas ou filtrar por status
        3. Marcar tarefas como concluídas
        4. Remover tarefas da lista
        5. Mudar o status da tarefa (ex: de "A Fazer" para "Em Andamento" e de "Em Andamento" para "Concluído")
        6. Gerar contexto temporal (data e hora atual) para organizar as tarefas do dia

        Ao adicionar tarefas, sempre passe o due_date como:
        - 'hoje' para tarefas do dia atual
        - 'amanhã' para o próximo dia
        - Um número inteiro como '7' para indicar daqui a X dias
        Nunca passe datas em formato brasileiro como '27/04/2026'.
    """,
    tools=[get_temporal_context, adicionar_tarefa, listar_tarefas, mudar_status_tarefa],
)