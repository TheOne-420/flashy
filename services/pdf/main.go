package main

import (
	"log"
	"os"

	"github.com/flashy/pdf-service/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.Logger())

	r.GET("/health", handlers.HealthCheck)
	r.POST("/extract-text", handlers.ExtractText)

	log.Printf("PDF service starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
