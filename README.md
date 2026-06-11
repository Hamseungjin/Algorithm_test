# Book Rental Platform Backend

Spring Boot, Java 21, JPA/Hibernate, MySQL, Gradle 기반 책 대여 플랫폼 백엔드입니다.

- 전체 설계, Mermaid ERD, 테이블 설명, 패키지 구조, 핵심 흐름: [`docs/architecture.md`](docs/architecture.md)
- 운영 DB DDL: [`src/main/resources/db/migration/V1__create_book_rental_schema.sql`](src/main/resources/db/migration/V1__create_book_rental_schema.sql)
- 실행: MySQL의 `book_rental` DB와 계정을 준비한 뒤 로컬에 Gradle 8.x를 설치하고 `gradle bootRun`
- 테스트: `gradle test`

인증은 아직 JWT를 사용하지 않습니다. 임시 권한 경계로 일반 API는 `X-User-Id`, 운영자 API는 `X-Admin-Id` 헤더를 받고 DB 역할을 검증합니다. 이후 해당 경계를 Spring Security의 `SecurityContext`로 교체할 수 있습니다.
