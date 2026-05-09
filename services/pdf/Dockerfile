FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o pdf-service .

FROM alpine:latest

RUN apk add --no-cache ca-certificates curl

WORKDIR /app

COPY --from=builder /app/pdf-service .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["./pdf-service"]