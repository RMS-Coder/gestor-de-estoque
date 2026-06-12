# Backend em Go (Gestor de Estoque)

Este diretório contém a conversão do backend (API) Node.js para a linguagem Go, já configurado com a distribuição estática do frontend.

## Requisitos
- **Go 1.22 ou superior** (Utilizamos os novos recursos de roteamento `http.NewServeMux` do Go 1.22+ e a funcionalidade `go:embed` para compilar o app em um único binário).

## Como rodar e compilar

1. O React frontend já foi compilado e os arquivos gerados estão na pasta `go-backend/dist`.
2. Entre no diretório do backend Go e utilize o comando para executar o servidor:
   ```bash
   cd go-backend
   go run main.go
   ```

A funcionalidade `go:embed` embutirá os arquivos da pasta `dist` dentro do seu executável.
Para compilar um arquivo `.exe` (ou executável de acordo com o seu sistema) independente, você pode rodar:

```bash
go build -o gestor-estoque main.go
```

Após iniciar, o aplicativo abrirá de imediato no navegador padrão (porta 3000) e os dados serão salvos localmente em um arquivo `data.json` na mesma pasta do executável.

## Estrutura Automática
- `main.go`: Contém toda a lógica e a técnica `go:embed`. Foram adicionadas funções para abrir a janela `http://localhost:3000` automaticamente utilizando o navegador do SO.
- `dist/`: Arquivos da Single-Page-Application em React.
