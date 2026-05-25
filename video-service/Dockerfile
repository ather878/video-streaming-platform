FROM gradle:8.7-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle :video-service:clean :video-service:bootJar --no-daemon

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/video-service/build/libs/app.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]