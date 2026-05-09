package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

const maxFileSize = 10 * 1024 * 1024

type ExtractTextResponse struct {
	Success   bool   `json:"success"`
	Text      string `json:"text"`
	PageCount int    `json:"pageCount"`
	Error     string `json:"error,omitempty"`
}

func ExtractText(c *gin.Context) {
	body, err := io.ReadAll(http.MaxBytesReader(c.Writer, c.Request.Body, maxFileSize))
	if err != nil {
		c.JSON(http.StatusRequestEntityTooLarge, ExtractTextResponse{
			Success: false,
			Error:   "File too large. Maximum size is 10MB",
		})
		return
	}

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
			Error:   "Failed to process PDF",
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

	outDir := tmpDir
	err = api.ExtractContentFile(tmpFile, outDir, []string{}, conf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ExtractTextResponse{
			Success: false,
			Error:   "Failed to extract text: " + err.Error(),
		})
		return
	}

	textFiles := []string{
		filepath.Join(outDir, "flashy.pdf_text.txt"),
		filepath.Join(outDir, "flashy.pdf_text_1.txt"),
	}

	var sb strings.Builder
	for _, fpath := range textFiles {
		if data, err := os.ReadFile(fpath); err == nil {
			sb.Write(data)
			os.Remove(fpath)
		}
	}

	c.JSON(http.StatusOK, ExtractTextResponse{
		Success:   true,
		Text:      cleanExtractedText(sb.String()),
		PageCount: pageCount,
	})
}

func cleanExtractedText(text string) string {
	lines := strings.Split(text, "\n")
	var cleaned []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) > 0 {
			cleaned = append(cleaned, trimmed)
		}
	}
	return strings.Join(cleaned, "\n")
}
