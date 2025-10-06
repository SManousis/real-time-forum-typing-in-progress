package handlers

import (
	"net/http"
)

func SetHandlers() *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("website/assets"))))
	// mux.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("website/js"))))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { serveApp(w, r) })

	return mux
}
