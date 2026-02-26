package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/cockroachdb/pebble"
)

// Product Struct
type Product struct {
	SKU   string  `json:"sku"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

// Invoice Struct (NEW)
type Invoice struct {
	ID    string    `json:"id"`
	Date  string    `json:"date"`
	Items []Product `json:"items"` // Reusing Product struct for cart items
	Total float64   `json:"total"`
}

var db *pebble.DB

func main() {
	var err error
	db, err = pebble.Open("inventory_data", &pebble.Options{})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/api/add-product", addProductHandler)
	http.HandleFunc("/api/search", searchProductHandler)
	http.HandleFunc("/api/checkout", checkoutHandler) // NEW ROUTE

	fmt.Println("Hytech Inventory Engine running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// NEW: Add Product Logic (With CORS Security Handshake)
func addProductHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// The Security Handshake
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost { return }

	var p Product
	json.NewDecoder(r.Body).Decode(&p)
	
	// Save to PebbleDB
	data, _ := json.Marshal(p)
	db.Set([]byte(p.SKU), data, pebble.Sync)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Product saved successfully!",
	})

}

func searchProductHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	sku := r.URL.Query().Get("sku")
	val, closer, err := db.Get([]byte(sku))
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	defer closer.Close()
	w.Header().Set("Content-Type", "application/json")
	w.Write(val)
}

// NEW: The Checkout Logic (With CORS Security Handshake)
func checkoutHandler(w http.ResponseWriter, r *http.Request) {
	// 1. The Security Handshake (CORS)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// If the browser is just doing its security check, say "OK" and stop here.
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Process the actual Sale
	if r.Method != http.MethodPost { return }

	var inv Invoice
	json.NewDecoder(r.Body).Decode(&inv)

	// Auto-generate a unique Invoice ID based on the exact second
	inv.ID = fmt.Sprintf("INV-%d", time.Now().Unix())
	inv.Date = time.Now().Format("2006-01-02 15:04:05")

	// Save the Invoice to the database
	data, _ := json.Marshal(inv)
	db.Set([]byte(inv.ID), data, pebble.Sync)

	// Send success message back to the React UI
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Success",
		"invoice_id": inv.ID,
	})
}