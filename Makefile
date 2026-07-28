SHELL := /bin/sh
.DEFAULT_GOAL := help

APP_PORT ?= 8080
IMAGE_TAG ?= local
COMPOSE ?= docker compose

.PHONY: help install dev test build verify preview \
	docker-config docker-build docker-up docker-down docker-restart \
	docker-logs docker-ps docker-shell health clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "DEA Study Lab commands:\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install exact npm dependencies
	npm ci

dev: ## Start the Vite development server
	npm run dev

test: ## Run content and scoring tests
	npm test

build: ## Create the production site in dist/
	npm run build

verify: test build ## Run all local verification

preview: build ## Preview the production build locally
	npm run preview

docker-config: ## Validate and render the Compose configuration
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) config

docker-build: ## Build the production container image
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) build

docker-up: ## Build and start the site in the background
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) up --build --detach
	@printf "DEA Study Lab: http://127.0.0.1:%s\n" "$(APP_PORT)"

docker-down: ## Stop and remove the Compose containers
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) down --remove-orphans

docker-restart: docker-down docker-up ## Recreate the container

docker-logs: ## Follow container logs
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) logs --follow app

docker-ps: ## Show the Compose service status
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) ps

docker-shell: ## Open a shell in the running app container
	APP_PORT=$(APP_PORT) IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) exec app sh

health: ## Check the running container health endpoint
	curl --fail --silent --show-error http://127.0.0.1:$(APP_PORT)/healthz

clean: ## Remove the local production build
	rm -rf dist

