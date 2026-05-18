# Gradle Commands Guide

## Basic Commands

### Build the entire project
```bash
./gradlew clean build -x test
```

### Build with tests
```bash
./gradlew clean build
```

### Run specific service
```bash
cd <service-name>
./gradlew bootRun
```

### Run tests
```bash
./gradlew test
```

### Build specific subproject
```bash
./gradlew :<service-name>:build
```

## Common Tasks

### Clean build directory
```bash
./gradlew clean
```

### View project dependencies
```bash
./gradlew dependencies
```

### Enable daemon for faster builds (optional)
```bash
./gradlew --daemon
```

### Build without daemon
```bash
./gradlew --no-daemon
```

### View gradle tasks
```bash
./gradlew tasks
```

### Refresh dependencies
```bash
./gradlew --refresh-dependencies
```

## Docker Build

### Build Docker images for services
```bash
./gradlew bootBuildImage
```

## Parallelized Builds

### Run gradle with parallel build (faster)
```bash
./gradlew build --parallel
```

## Troubleshooting

### Clear Gradle cache
```bash
rm -rf ~/.gradle/caches
./gradlew clean
```

### Rebuild without cache
```bash
./gradlew --no-build-cache clean build
```

### Check Gradle version
```bash
./gradlew --version
```

## IDE Integration

### Generate IDE files
```bash
./gradlew cleanIdea idea
```

## Performance Tips

1. **Enable Gradle daemon** - Speeds up builds by reusing the JVM
   ```bash
   echo "org.gradle.daemon=true" >> gradle.properties
   ```

2. **Configure max workers** - Speeds up parallel builds
   ```bash
   echo "org.gradle.workers.max=4" >> gradle.properties
   ```

3. **Enable build cache** - Caches build outputs
   ```bash
   echo "org.gradle.caching=true" >> gradle.properties
   ```

## More Information

- [Gradle Official Documentation](https://docs.gradle.org)
- [Spring Boot Gradle Plugin](https://spring.io/guides/gs/gradle/)

