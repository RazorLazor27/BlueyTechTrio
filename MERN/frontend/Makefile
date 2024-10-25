# Variables por defecto
LOCAL_PORT=4000

# Colores para mensajes
GREEN=\033[0;32m
NC=\033[0m # No Color
YELLOW=\033[1;33m

.PHONY: help setup setup-local setup-demo clean check

# Target por defecto muestra la ayuda
help:
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@echo "  make setup         - Configura ambos entornos (local y demo)"
	@echo "  make setup-local   - Configura solo el entorno local"
	@echo "  make setup-demo    - Configura solo el entorno demo"
	@echo "  make clean         - Elimina los archivos de configuracion"
	@echo "  make check         - Verifica la configuracion actual"

# Configura ambos entornos
setup: setup-local setup-demo
	@echo "$(GREEN)+ Configuracion completada para ambos entornos$(NC)"

# Configura el entorno local
setup-local:
	@if [ ! -f .env.local ]; then \
		echo "VITE_API_BASE_URL=http://localhost:4000/api" > .env.local; \
		echo "$(GREEN)+ Archivo .env.local creado$(NC)"; \
	else \
		echo "$(YELLOW)! .env.local ya existe. No se ha sobrescrito.$(NC)"; \
	fi

# Configura el entorno demo
setup-demo:
	@if [ ! -f .env.demo ]; then \
		echo "VITE_API_BASE_URL=/api" > .env.demo; \
		echo "$(GREEN)+ Archivo .env.demo creado$(NC)"; \
	else \
		echo "$(YELLOW)! .env.demo ya existe. No se ha sobrescrito.$(NC)"; \
	fi

# Limpia los archivos de configuracion
clean:
	@rm -f .env.local .env.demo
	@echo "$(GREEN)+ Archivos de configuracion eliminados$(NC)"

# Verificar la configuracion actual
check:
	@echo "$(YELLOW)Verificando archivos de configuracion:$(NC)"
	@if [ -f .env.local ]; then \
		echo "$(GREEN)+ .env.local existe$(NC)"; \
		echo "   Contenido:"; \
		cat .env.local; \
	else \
		echo "$(YELLOW)! .env.local no existe$(NC)"; \
	fi
	@echo ""
	@if [ -f .env.demo ]; then \
		echo "$(GREEN)+ .env.demo existe$(NC)"; \
		echo "   Contenido:"; \
		cat .env.demo; \
	else \
		echo "$(YELLOW)! .env.demo no existe$(NC)"; \
	fi