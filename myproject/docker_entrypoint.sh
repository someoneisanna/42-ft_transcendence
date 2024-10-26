#!/bin/bash

set -e

HOST="$1"
shift
CMD="$@"

# Wait for PostgreSQL to be ready
until pg_isready -h "$HOST"; do
	>&2 echo "Postgres is unavailable - sleeping"
	sleep 1
done

>&2 echo "Postgres is up - collecting static files"
python manage.py collectstatic --noinput

>&2 echo "Postgres is up - applying migrations"
python manage.py makemigrations
python manage.py migrate

>&2 echo "Postgres is up - executing command"
exec $CMD
