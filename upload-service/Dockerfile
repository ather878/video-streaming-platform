FROM gradle:8.7-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle :upload-service:clean :upload-service:bootJar --no-daemon

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/upload-service/build/libs/app.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]