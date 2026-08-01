# Stage 1: Build Stage (Gradle + Kotlin)
FROM gradle:8.6-jdk21-alpine AS builder
WORKDIR /app
COPY . .
RUN gradle shadowJar --no-daemon

# Stage 2: Lightweight Runtime (Eclipse Temurin JRE 21)
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder /app/build/libs/kotlin-runtime-all.jar /app/runner.jar
USER appuser

EXPOSE 8080
CMD ["java", "-jar", "/app/runner.jar"]