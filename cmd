T1
docker exec $(docker ps --filter "name=frontend" --format "{{.ID}}") uname -a

T2
docker stop $(docker ps --filter "name=product" --format "{{.ID}}")

docker start $(docker ps -a --filter "name=product" --format "{{.ID}}")