🍚 Honbap Project: Spring Boot 기반 소셜 커뮤니티

💡 프로젝트 개요
이 프로젝트는 혼자 식사하는 사용자들을 위한 소셜 커뮤니티 웹 서비스의 백엔드 시스템입니다. 사용자들이 익명 또는 실명으로 게시물을 작성하고 댓글을 통해 소통하며, 식사 정보 및 리뷰를 공유할 수 있도록 안정적인 서버 환경을 구축하는 데 중점을 두었습니다.

🛠️ 주요 기술 스택
구분
기술
버전역할언어/프레임워크Java17핵심 비즈니스 로직 구현Spring Boot3.2.0프로젝트 초기 설정 및 WAS 내장데이터베이스MySQL게시물, 사용자 정보 등 데이터 저장의존성 관리Gradle빌드 및 라이브러리 관리보안Spring Security사용자 인증/인가 및 접근 제어뷰 템플릿Thymeleaf서버 측 렌더링(SSR)을 통한 화면 구성⚙️ 주요 기능 및 구현 사항이 프로젝트에서 백엔드 개발자로서 집중적으로 구현한 핵심 기능들입니다.1. 사용자 관리 및 보안 (Security)Spring Security 기반 인증/인가: 사용자 로그인, 회원가입, 세션 관리를 Spring Security를 사용하여 안전하게 구현했습니다.권한 관리: 일반 사용자(USER)와 관리자(ADMIN) 권한을 구분하여 접근 가능한 페이지를 제어했습니다.2. 게시판 (Board) 기능CRUD 구현: 게시물 생성(Create), 조회(Read), 수정(Update), 삭제(Delete) 기능을 RESTful 원칙에 따라 구현했습니다.댓글 시스템: 게시물별 댓글을 구현하고, 댓글 작성자만 수정/삭제가 가능하도록 접근 제어를 적용했습니다.3. 데이터베이스 관리 (Persistence)MySQL 설계: 서비스 요구사항에 맞춰 사용자, 게시물, 댓글 테이블 등 관계형 데이터베이스 스키마를 설계하고 구현했습니다.트랜잭션 관리: 서비스 계층에서 데이터의 일관성을 유지하기 위한 트랜잭션 처리를 적용했습니다.💻 프로젝트 실행 방법로컬 환경에서 프로젝트를 실행하기 위한 단계별 가이드입니다.전제 조건JDK 17 이상MySQL 8.0 이상Gradle 7.x 이상1. 레포지토리 클론Bashgit clone https://github.com/zinuzanu/honbap-project.git
cd honbap-project
2. 데이터베이스 설정로컬 MySQL 서버에 honbap_db (또는 원하는 이름) 데이터베이스를 생성합니다.src/main/resources/application.properties 또는 application.yml 파일에서 데이터베이스 접속 정보를 설정합니다.Properties# application.properties 예시
spring.datasource.url=jdbc:mysql://localhost:3306/honbap_db?serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update # 개발 환경에서 사용
3. 프로젝트 실행Gradle 명령어를 사용하여 Spring Boot 애플리케이션을 실행합니다.Bash# 터미널에서 실행
./gradlew bootRun
4. 접속 확인서버가 성공적으로 실행되면, 웹 브라우저에서 다음 주소로 접속할 수 있습니다.주소: http://localhost:8080 (기본 설정 포트)🧑‍💻 기여자 (Contributing)이름역할[본인 이름/닉네임]백엔드 개발 및 DB 설계 담당[팀원 이름]프론트엔드/기획 등 (선택 사항)🔗 포트폴리오 및 관련 링크GitHub Repository: https://github.com/zinuzanu/honbap-project배포/데모 URL: (서비스 배포 완료 시 여기에 URL 기재)기술 회고/문서: (프로젝트 상세 설명 노션/블로그 링크 기재)
