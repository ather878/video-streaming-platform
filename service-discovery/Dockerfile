FROM gradle:8.7-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle :service-discovery:clean :service-discovery:bootJar --no-daemon

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/service-discovery/build/libs/app.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]