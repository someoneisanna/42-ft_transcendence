NAME = ft_transcendence

CERTS_DIR = $(CURDIR)/nginx/ssl_certs

.PHONY: help up down status clean prune

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  up         Build and start the containers"
	@echo "  down       Stop and remove the containers"
	@echo "  down_c     Stop and remove the containers, images and volumes"
	@echo "  status     Show the status of the containers, images, volumes and networks"
	@echo "  clean      Remove all the containers, images and volumes"
	@echo "  prune      Cleans up the docker system"
	@echo "  django     Access the django container"
	@echo "  certs      Generate self-signed certificates"

up: mkdirs
	@docker-compose -p $(NAME) up --build

down:
	@docker-compose -p $(NAME) down

down_c:
	@docker-compose -p $(NAME) down
	@docker rmi -f $$(docker images -q) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm ft_transcendence_network || true

status:
	@echo "\n--------------------------------------- CONTAINERS -------------------------------------\n"
	@docker-compose -p $(NAME) ps
	@echo "\n--------------------------------------- IMAGES -----------------------------------------\n"
	@docker images
	@echo "\n--------------------------------------- VOLUMES ----------------------------------------\n"
	@docker volume ls
	@echo "\n--------------------------------------- NETWORKS ---------------------------------------\n"
	@docker network ls
	@echo "\n"

clean:
	@docker rm -f $$(docker ps -a -q) || true
	@docker rmi -f $$(docker images -q) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm ft_transcendence_network || true

prune:
	@sudo docker system prune -a --volumes

django:
	docker exec -it transcendence_django bash

postgres:
	docker exec -it transcendence_postgres bash

redis:
	docker exec -it transcendence_redis redis-cli

mkdirs:
	@mkdir -p database

certs:
	@mkdir -p nginx/ssl_certs
	@openssl genpkey -algorithm RSA -out $(CERTS_DIR)/selfsigned.key
	@openssl req -new -x509 -key $(CERTS_DIR)/selfsigned.key -out $(CERTS_DIR)/selfsigned.crt -days 365 -subj "/CN=localhost"
