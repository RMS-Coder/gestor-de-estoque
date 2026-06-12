package main

import (
	"crypto/rand"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

//go:embed dist/*
var embeddedFiles embed.FS

type Item struct {
	ID         string `json:"id"`
	Nome       string `json:"nome"`
	Quantidade int    `json:"quantidade"`
}

var (
	dataFile = "data.json"
	mu       sync.Mutex
)

// Helper: Gera um ID pseudo-aleatório no formato UUID para os itens
func generateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

// Helper: Lê os dados do arquivo JSON
func readData() ([]Item, error) {
	mu.Lock()
	defer mu.Unlock()

	data, err := os.ReadFile(dataFile)
	if err != nil {
		if os.IsNotExist(err) {
			return []Item{}, nil
		}
		return nil, err
	}

	var items []Item
	if err := json.Unmarshal(data, &items); err != nil {
		return []Item{}, nil // Retorna vazio caso o JSON seja inválido
	}
	return items, nil
}

// Helper: Salva os dados no arquivo JSON
func writeData(items []Item) error {
	mu.Lock()
	defer mu.Unlock()

	data, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(dataFile, data, 0644)
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Println("Error encoding JSON response:", err)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

// Função para abrir o navegador
func openBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	case "linux":
		cmd = "xdg-open"
		args = []string{url}
	default:
		return fmt.Errorf("unsupported platform")
	}

	return exec.Command(cmd, args...).Start()
}

func main() {
	// Definir o caminho para o data.json no diretório de execução atual
	cwd, _ := os.Getwd()
	dataFile = filepath.Join(cwd, "data.json")

	mux := http.NewServeMux()

	// ==========================================
	// API Endpoints
	// ==========================================

	// GET /api/items
	mux.HandleFunc("GET /api/items", func(w http.ResponseWriter, r *http.Request) {
		items, err := readData()
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to read data")
			return
		}
		respondJSON(w, http.StatusOK, items)
	})

	// POST /api/items
	mux.HandleFunc("POST /api/items", func(w http.ResponseWriter, r *http.Request) {
		var payload struct {
			Nome       string `json:"nome"`
			Quantidade int    `json:"quantidade"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		if payload.Nome == "" {
			payload.Nome = "Novo Item"
		}

		items, err := readData()
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to read data")
			return
		}

		newItem := Item{
			ID:         generateID(),
			Nome:       payload.Nome,
			Quantidade: payload.Quantidade,
		}
		items = append(items, newItem)

		if err := writeData(items); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to write data")
			return
		}

		respondJSON(w, http.StatusCreated, newItem)
	})

	// PUT /api/items/{id}
	mux.HandleFunc("PUT /api/items/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Requer Go 1.22+
		id := r.PathValue("id")

		var updates struct {
			Nome       *string `json:"nome"`
			Quantidade *int    `json:"quantidade"`
		}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		items, err := readData()
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to read data")
			return
		}

		found := false
		var updatedItem Item
		for i, item := range items {
			if item.ID == id {
				if updates.Nome != nil {
					items[i].Nome = *updates.Nome
				}
				if updates.Quantidade != nil {
					items[i].Quantidade = *updates.Quantidade
				}
				updatedItem = items[i]
				found = true
				break
			}
		}

		if !found {
			respondError(w, http.StatusNotFound, "Item not found")
			return
		}

		if err := writeData(items); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to write data")
			return
		}

		respondJSON(w, http.StatusOK, updatedItem)
	})

	// DELETE /api/items/{id}
	mux.HandleFunc("DELETE /api/items/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")

		items, err := readData()
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to read data")
			return
		}

		newItems := make([]Item, 0, len(items))
		for _, item := range items {
			if item.ID != id {
				newItems = append(newItems, item)
			}
		}

		if err := writeData(newItems); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to write data")
			return
		}

		respondJSON(w, http.StatusOK, map[string]bool{"success": true})
	})

	// ==========================================
	// Servindo a Aplicação React (Frontend)
	// ==========================================
	
	// Create a sub fs for the dist directory
	distRoot, err := fs.Sub(embeddedFiles, "dist")
	if err != nil {
		log.Fatalf("Falha ao abrir arquivos embutidos: %v", err)
	}

	distFS := http.FileServer(http.FS(distRoot))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Se for uma requisição de API que chegou aqui, não retornar o index
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}

		// 🚨 CORREÇÃO AQUI: Convertemos o caminho para usar barras '/' do estilo Unix
		// Isso evita que o Windows quebre a busca de arquivos dentro do embed
		cleanPath := strings.TrimPrefix(filepath.ToSlash(filepath.Clean(r.URL.Path)), "/")
		if cleanPath == "." {
			cleanPath = "index.html"
		}
		
		f, err := distRoot.Open(cleanPath)
		if err != nil {
			// Não encontrou o arquivo, fallback para index.html (SPA)
			r.URL.Path = "/"
		} else {
			f.Close()
		}

		distFS.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	serverURL := "http://localhost:" + port
	log.Printf("Server running on %s", serverURL)

	go func() {
		// Dá um tempinho pro servidor subir
		time.Sleep(500 * time.Millisecond)
		log.Println("Abrindo navegador...")
		openBrowser(serverURL)
	}()

	if err := http.ListenAndServe("0.0.0.0:"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
