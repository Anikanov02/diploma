FROM maven:3.8.3-openjdk-17

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY . .

RUN mvn package

CMD ["mvn", "spring-boot:run"]