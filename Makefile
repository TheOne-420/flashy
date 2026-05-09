.PHONY: deps dev stop

deps:
	docker compose up -d

dev: deps
	bun dev

stop:
	docker compose down