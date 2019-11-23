# Nodejs_Database_Example
## node.js 서버에서 구현한 간단한 암호화 로그인 예제




- 목표
  - node.js + Express 모듈로 웹 서버 구현해보기
  - mysql DB 연결하여 회원 추가, 로그인 기능 구현
  - crypto 모듈을 사용하여 비밀번호를 단방향 암호화하여 저장하기

---
- 에러

    콜백함수 안에서 또 콜백함수를 사용하여 처리하자, <br>
    _Can't set headers after they are sent._ 라는 중첩 헤더 선언 메시지 발생.
      

- 해결

    Promise를 사용한 코드로 수정하여 문제를 해결함

