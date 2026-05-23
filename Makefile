# Yerel geliştirme: docker compose (varsayılan docker-compose.yml)
COMPOSE := docker compose
COMPOSE_FILE ?= docker-compose.yml

.PHONY: help up down logs restart ps

help: ## Bu yardımı gösterir
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Tüm servisleri arka planda başlatır (build ile)
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

down: ## Tüm servisleri durdurur (volume'leri silmez)
	$(COMPOSE) -f $(COMPOSE_FILE) down

logs: ## Tüm servis loglarını takip et
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f

restart: ## Servisleri yeniden başlatır
	$(COMPOSE) -f $(COMPOSE_FILE) restart

ps: ## Çalışan container'ları listele
	$(COMPOSE) -f $(COMPOSE_FILE) ps
