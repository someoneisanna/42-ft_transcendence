FROM python:3.10

RUN apt-get update && apt-get install -y \
	zlib1g-dev \
	libjpeg-dev \
	postgresql-client \
	redis-tools \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 8000

WORKDIR /app

COPY requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/

COPY docker_entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
