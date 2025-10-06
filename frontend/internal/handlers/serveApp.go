package handlers

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path"
)

func serveApp(w http.ResponseWriter, r *http.Request) {
	fmt.Println("serve app handler called")
	if r.URL.Path != "/" && r.URL.Path != "/index" {
		w.WriteHeader(404)
		w.Write([]byte("sorry"))
		fmt.Println("Bad url:", r.URL)
		return
	}

	// Parse the template
	tmpl, err := template.ParseFiles(path.Join("website", "index.html"))
	if err != nil {
		log.Printf("Error parsing template: %v\n", err)
		return
	}

	if err := tmpl.ExecuteTemplate(w, "index.html", nil); err != nil {
		log.Printf("Template execution error: %v\n", err)
	}
}
