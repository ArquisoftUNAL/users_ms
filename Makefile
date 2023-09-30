docker-build:
	docker build -t habitus_users_ms .

docker-run:
	docker run -d --name habitus_users_ms -p 3000:3000 --env-file .env habitus_users_ms