FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY . .

CMD ["mvn", "-pl", "inventory-service", "spring-boot:run"]