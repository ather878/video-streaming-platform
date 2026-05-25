FROM gradle:8.7-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle :api-gateway:clean :api-gateway:bootJar --no-daemon

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/api-gateway/build/libs/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]