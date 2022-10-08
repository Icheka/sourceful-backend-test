start: build up logs

build:
	docker build api/ --no-cache -t api
	docker build client/ --no-cache -t client

up:
	docker-compose -f ./devtools/docker-compose.yaml up -d

logs:
	docker logs -f api

clean:
	docker stop api
	docker rm api
	
	docker stop client
	docker rm client