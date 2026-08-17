package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

const maxFileSize = 30 * 1024 * 1024

type ExtractTextResponse struct {
	Success   bool   `json:"success"`
	Text      string `json:"text"`
	PageCount int    `json:"pageCount"`
	Error     string `json:"error,omitempty"`
}

func main() {
	r := gin.New()
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "pdf-service"})
	})

	r.POST("/extract-text", extractText)

	fmt.Println("PDF service starting on port 8080")
	if err := r.Run(":8080"); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}
}

func extractText(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, ExtractTextResponse{
			Success: false,
			Error:   "No file provided",
		})
		return
	}
	defer file.Close()

	body, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ExtractTextResponse{
			Success: false,
			Error:   "Failed to read file: " + err.Error(),
		})
		return
	}

	fmt.Printf("Received file: %s, size: %d bytes\n", header.Filename, len(body))

	if len(body) < 5 || string(body[:5]) != "%PDF-" {
		c.JSON(http.StatusBadRequest, ExtractTextResponse{
			Success: false,
			Error:   "Invalid PDF file",
		})
		return
	}

	tmpDir := os.TempDir()
	tmpFile := filepath.Join(tmpDir, "flashy-"+time.Now().Format("20060102150405")+".pdf")
	if err := os.WriteFile(tmpFile, body, 0600); err != nil {
		c.JSON(http.StatusInternalServerError, ExtractTextResponse{
			Success: false,
			Error:   "Failed to write temp file",
		})
		return
	}
	defer os.Remove(tmpFile)

	conf := model.NewDefaultConfiguration()

	ctx, err := api.ReadContextFile(tmpFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ExtractTextResponse{
			Success: false,
			Error:   "Failed to read PDF: " + err.Error(),
		})
		return
	}

	pageCount := ctx.PageCount
	fmt.Printf("PDF has %d pages\n", pageCount)

	text, err := extractTextWithOCR(tmpFile, pageCount)
	if err != nil {
		fmt.Printf("OCR failed, trying pdfcpu: %v\n", err)
		text, err = extractTextWithPdfcpu(tmpFile, conf)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ExtractTextResponse{
				Success: false,
				Error:   "Failed to extract text: " + err.Error(),
			})
			return
		}
	}

	fmt.Printf("Extracted %d chars of text\n", len(text))

	c.JSON(http.StatusOK, ExtractTextResponse{
		Success:   true,
		Text:      text,
		PageCount: pageCount,
	})
}

func extractTextWithPdfcpu(tmpFile string, conf *model.Configuration) (string, error) {
	outDir := filepath.Dir(tmpFile)

	err := api.ExtractContentFile(tmpFile, outDir, []string{}, conf)
	if err != nil {
		return "", err
	}

	var sb strings.Builder
	baseName := strings.TrimSuffix(filepath.Base(tmpFile), filepath.Ext(filepath.Base(tmpFile)))
	patterns := []string{
		filepath.Join(outDir, baseName+"_text.txt"),
		filepath.Join(outDir, baseName+"_text_1.txt"),
		filepath.Join(outDir, baseName+".pdf_text.txt"),
		filepath.Join(outDir, baseName+".pdf_text_1.txt"),
	}

	for _, pattern := range patterns {
		if data, err := os.ReadFile(pattern); err == nil {
			sb.Write(data)
			os.Remove(pattern)
		}
	}

	return sb.String(), nil
}

func extractTextWithOCR(pdfPath string, pageCount int) (string, error) {
	tmpDir := filepath.Dir(pdfPath)
	imagesDir := filepath.Join(tmpDir, "ocr-"+time.Now().Format("20060102150405"))
	if err := os.MkdirAll(imagesDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create images dir: %w", err)
	}
	defer os.RemoveAll(imagesDir)

	fmt.Printf("Converting PDF to images using pdftoppm...\n")

	cmd := exec.Command("pdftoppm", "-r", "300", "-png", pdfPath, filepath.Join(imagesDir, "page"))
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("pdftoppm failed: %w", err)
	}

	files, err := filepath.Glob(filepath.Join(imagesDir, "page*.png"))
	if err != nil || len(files) == 0 {
		return "", fmt.Errorf("no images generated")
	}

	fmt.Printf("Generated %d images, running OCR...\n", len(files))

	var sb strings.Builder
	for _, imgFile := range files {
		cmd := exec.Command("tesseract", imgFile, "stdout", "-l", "eng")
		var out bytes.Buffer
		cmd.Stdout = &out
		if err := cmd.Run(); err != nil {
			fmt.Printf("Tesseract failed for %s: %v\n", imgFile, err)
			continue
		}
		sb.WriteString(out.String())
		os.Remove(imgFile)
	}

	return sb.String(), nil
}
