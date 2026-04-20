package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

var jwtKey = []byte("my_secret_key_change_in_production")

type TicketVerificationRequest struct {
	TicketBarcode string `json:"ticketBarcode"`
	VenueID       string `json:"venueId"`
	EventID       string `json:"eventId"`
}

type StaffLoginRequest struct {
	EmployeeID string `json:"employeeId"`
	PIN        string `json:"pin"`
	VenueID    string `json:"venueId"`
}

func main() {
	r := mux.NewRouter()

	// API v1 router
	api := r.PathPrefix("/api/v1/auth").Subrouter()
	api.HandleFunc("/verify-ticket", VerifyTicketHandler).Methods("POST")
	api.HandleFunc("/staff/login", StaffLoginHandler).Methods("POST")
	api.HandleFunc("/health", HealthCheckHandler).Methods("GET")

	srv := &http.Server{
		Handler:      r,
		Addr:         ":8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Println("Auth Service listening on :8080")
	log.Fatal(srv.ListenAndServe())
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func VerifyTicketHandler(w http.ResponseWriter, r *http.Request) {
	var req TicketVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Integrate with Ticket Provider API here.
	// For now, mock a successful response.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"eventId":     req.EventID,
		"sectionCode": "A1",
		"language":    "en",
		"mobility":    "NONE",
		"exp":         time.Now().Add(time.Hour * 12).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Failed to sign token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"sessionToken":    tokenString,
		"section":         "A1",
		"seat":            "14",
		"venueMapUrl":     "https://cdn.example.com/maps/" + req.VenueID + ".json",
		"welcomeLanguage": "en",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func StaffLoginHandler(w http.ResponseWriter, r *http.Request) {
	var req StaffLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Verify against DB
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"employeeId": req.EmployeeID,
		"role":       "STEWARD",
		"venueId":    req.VenueID,
		"exp":        time.Now().Add(time.Hour * 8).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Failed to sign token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"accessToken":   tokenString,
		"role":          "STEWARD",
		"assignedZones": []string{"zone-1", "zone-2"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
