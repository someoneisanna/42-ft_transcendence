#!/bin/bash

set -e

# Wait for PostgreSQL to be ready
until pg_isready -h "postgres"; do
	>&2 echo "Postgres is unavailable - sleeping"
	sleep 1
done

# Wait for Redis to be ready
until redis-cli -h "redis" ping | grep -q PONG; do
	>&2 echo "Redis is unavailable - sleeping"
	sleep 1
done

>&2 echo "Postgres and Redis are up - applying migrations"
python manage.py makemigrations myapp
python manage.py migrate

>&2 echo "Postgres is up - executing command"
exec "$@"
