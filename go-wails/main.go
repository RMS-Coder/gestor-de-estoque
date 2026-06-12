package main

import (
	"embed"
	"log"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:dist
var assets embed.FS

func main() {
	// Cria uma instância da Application struct
	app := NewApp()

	// Configurar o roteador da nossa API REST (reaproveitando a lógica anterior)
	apiHandler := buildAPIHandler()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Gestor de Estoque",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: apiHandler, // Fallback HTTP handler para interceptar transparentemente as requisições /api/
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		log.Fatal("Error starting app:", err.Error())
	}
}
