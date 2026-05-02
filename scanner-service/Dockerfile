FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY . .

CMD ["mvn", "-pl", "scanner-service", "spring-boot:run"]