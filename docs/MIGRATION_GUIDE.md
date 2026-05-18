# Maven to Gradle Migration Guide

## Overview
This project has been migrated from Maven to Gradle. This document explains what was changed and how to use the new build system.

## Changes Made

### 1. Replaced Build Files
- **Removed**: All `pom.xml` files from root and each service
- **Added**: `build.gradle` files for each service
- **Added**: Root `build.gradle` for shared configuration
- **Added**: `settings.gradle` for multi-project setup

### 2. Gradle Wrapper
- **Added**: `gradle/wrapper/gradle-wrapper.properties` - Specifies Gradle version (8.5)
- **Added**: `gradlew` - Unix shell script to run Gradle
- **Added**: `gradlew.bat` - Windows batch script to run Gradle

### 3. Configuration Files
- **Added**: `gradle.properties` - Global Gradle settings
- **Updated**: `scripts/setup.sh` - Updated to use Gradle commands
- **Updated**: `.gitignore` - Added Gradle-specific patterns

### 4. Documentation
- **Updated**: `docs/README.md` - Updated build instructions
- **Added**: `docs/GRADLE_GUIDE.md` - Comprehensive Gradle command reference

## Key Differences

### Building
```bash
# Maven (old)
mvn clean install -DskipTests

# Gradle (new)
./gradlew clean build -x test
```

### Running Services
```bash
# Maven (old)
cd auth-service
mvn spring-boot:run

# Gradle (new)
cd auth-service
./gradlew bootRun
```

### Running Tests
```bash
# Maven (old)
mvn test

# Gradle (new)
./gradlew test
```

### Building Specific Service
```bash
# Maven (old)
cd auth-service
mvn clean install

# Gradle (new)
./gradlew :auth-service:build
```

## Project Structure

### Multi-Project Build
The root `build.gradle` defines common configurations for all subprojects:
- Java version (17)
- Spring Boot version (3.2.0)
- Spring Cloud version (2023.0.0)
- Common dependencies

### Service build.gradle Files
Each service has its own `build.gradle` with specific dependencies:
- `api-gateway` - Gateway dependencies
- `auth-service` - Security, JPA, MySQL
- `user-service` - JPA, MySQL
- `video-service` - Elasticsearch, MySQL
- And so on...

### Common Library
The `common-lib` service provides shared code for all services:
- ApiResponse DTO
- Global exception handler
- Common utilities

## Getting Started

### Prerequisites
- Java 17 or higher
- Git

### No need to install Gradle!
The project includes Gradle Wrapper. Just use:
```bash
./gradlew  # on macOS/Linux
gradlew.bat  # on Windows
```

### First Build
```bash
cd /Users/ather/IdeaProjects/video-streaming-platform
./gradlew clean build -x test
```

### Running the Setup Script
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Build Performance

### Enable Daemon (Faster Builds)
The `gradle.properties` file is already configured with:
```properties
org.gradle.daemon=true
org.gradle.workers.max=4
org.gradle.caching=true
```

### First build will be slower, subsequent builds much faster!

## IDE Integration

### IntelliJ IDEA
1. Open project root directory
2. IntelliJ will auto-detect Gradle project
3. Gradle tool window appears on right side
4. You can run tasks from IDE

### Visual Studio Code
1. Install "Gradle for Java" extension
2. Open project root
3. VSCode will detect Gradle
4. Use tasks: Run -> Run Task -> Gradle

### Eclipse
1. Install "Buildship: Eclipse Gradle IDE"
2. Import as Gradle project
3. Eclipse will auto-configure

## Dependency Management

### Centralized Dependency Management
The root `build.gradle` uses:
```gradle
dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2023.0.0"
        mavenBom "org.springframework.boot:spring-boot-dependencies:3.2.0"
    }
}
```

This ensures all services use compatible versions.

### Adding Dependencies
To add a dependency to a service, edit its `build.gradle`:

```gradle
dependencies {
    implementation 'org.example:library:1.0.0'
}
```

## Troubleshooting

### Gradle Cache Issues
```bash
# Clear cache and rebuild
./gradlew --no-build-cache clean build
```

### Dependency Issues
```bash
# Refresh dependencies
./gradlew --refresh-dependencies clean build
```

### Permission Denied on gradlew
```bash
chmod +x gradlew
```

## Maven vs Gradle - Command Reference

| Task | Maven | Gradle |
|------|-------|--------|
| Clean | `mvn clean` | `./gradlew clean` |
| Build | `mvn install` | `./gradlew build` |
| Build without tests | `mvn install -DskipTests` | `./gradlew build -x test` |
| Run tests | `mvn test` | `./gradlew test` |
| Run Spring Boot | `mvn spring-boot:run` | `./gradlew bootRun` |
| Build specific module | `cd module && mvn install` | `./gradlew :module:build` |
| View dependencies | `mvn dependency:tree` | `./gradlew dependencies` |

## Additional Resources

- [Gradle Official Docs](https://docs.gradle.org)
- [Spring Boot Gradle Plugin](https://spring.io/guides/gs/gradle/)
- [Gradle for Maven Users](https://docs.gradle.org/current/userguide/migrating_from_maven.html)

## Support

For detailed Gradle commands and options, see `docs/GRADLE_GUIDE.md`

