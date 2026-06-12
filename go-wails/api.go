package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
)

type Item struct {
	ID         string `json:"id"`
	Nome       string `json:"nome"`
	Quantidade int    `json:"quantidade"`
}

var (
	dataFile = "data.json"
	mu       sync.Mutex
)

func init() {
	cwd, _ := os.Getwd()
	dataFile = filepath.Join(cwd, "data.json")
}

// Helpers
func generateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

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
		return []Item{}, nil
	}
	return items, nil
}

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

// buildAPIHandler cria o mux com as rotas que foram trazidas da v1
func buildAPIHandler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/items", func(w http.ResponseWriter, r *http.Request) {
		items, err := readData()
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to read data")
			return
		}
		respondJSON(w, http.StatusOK, items)
	})

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

	mux.HandleFunc("PUT /api/items/{id}", func(w http.ResponseWriter, r *http.Request) {
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

	return mux
}
