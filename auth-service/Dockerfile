FROM gradle:8.7-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle :auth-service:clean :auth-service:bootJar --no-daemon

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/auth-service/build/libs/app.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]