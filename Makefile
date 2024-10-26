NAME = ft_transcendence

.PHONY: help up down status clean prune

all: help

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
	@echo "  postgres   Access the postgres container"
	@echo "  django     Access the django container"
	@echo "  nginx      Access the nginx container"

up: mkdirs
	@docker-compose -p $(NAME) up --build

down:
	@docker-compose -p $(NAME) down

down_c:
	@docker-compose -p $(NAME) down
	@docker rmi -f $$(docker images -q) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm 42-ft_transcendence_network || true

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
	@docker network rm 42-ft_transcendence_network || true

prune:
	@sudo docker system prune -a --volumes

postgres:
	docker-compose exec postgres bash

django:
	docker-compose exec django bash

nginx:
	docker-compose exec nginx bash

mkdirs:
	@mkdir -p frontend/static
	@mkdir -p database
