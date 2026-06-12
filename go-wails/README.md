# Aplicação Desktop com Wails

Este diretório contém a conversão do Gestor de Estoque (anteriormente servido como API) para uma **aplicação Desktop nativa** utilizando o framework [Wails](https://wails.io).

Foi utilizada uma técnica onde o frontend React continua chamando a API de forma totalmente transparente através da rota original `/api/items`. Em vez de subir um servidor isolado ou usar ligações de bindings Go rígidas que nos forçaria a reescrever o React Frontend para usar chamadas JS exóticas, interceptamos as chamadas da API usando o próprio fallback do Webview (`AssetServer.Handler`) embutido no Wails. Ao embutir a pasta pronta `dist/`, a transição de um sistema web para um desktop stand-alone foi feita sem alterar uma única linha de código do Frontend.

## Requisitos

- [Go](https://go.dev/dl/) 1.22 ou mais novo (Necessário para as features do roteador `GET /` nativas que foram utilizadas na implementação.)
- Framework [Wails](https://wails.io/docs/gettingstarted/installation). Dependências C necessitam estar instaladas e aprovadas com o `wails doctor` seguindo o sistema operacional.

## Como Compilar / Rodar Localmente

Certifique-se de que a CLI do Wails está instalada em seu ambiente global GO:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Dentro deste diretório (`go-wails`), sincronize os pacotes do módulo (O Go irá fazer o fetch do github do Wails):
```bash
go mod tidy
```

E finalmente para rodar rapidamente a janela em um sandbox de desenvolvedor sem precisar fazer pacote/build final:
```bash
wails dev
```

Se desejar **compilar de verdade a versão desktop** como um executável de produção super rápido (como `.exe`, `.app`, ou binário em Linux), você não usa o `go build`, mas sim os pipelines otimizados de build do wails pelo comando:
```bash
wails build
```

Isso processará as DLLs e empacotará o frontend React embedando numa aplicação standalone super veloz que será lançada na pasta `build/bin/`.
