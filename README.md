# Nodejs_Database_Example
## node.js 서버에서 구현한 간단한 암호화 로그인 예제




- 목표

  ##### - node.js로 서버 구현해보기

  ##### - mysql로 연결해보기

  ##### - crypto 모듈을 사용하여 비밀번호를 암호화하여 저장하기



- 에러

      콜백함수 안에서 또 콜백함수를 사용하여 처리하자, 
      _Can't set headers after they are sent._ 라는 중첩 헤더 선언 메시지 발생.
      

- 해결

      Promise를 사용한 코드로 수정하여 문제를 해결함
