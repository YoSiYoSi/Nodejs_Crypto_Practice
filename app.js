/**
 * MySQL 데이터베이스 사용하기
 *
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 * (먼저 사용자 추가 후 로그인해야 함)
 *    http://localhost:3000/public/login2.html
 *    http://localhost:3000/public/adduser2.html
 *
 * @date 2016-11-10
 * @author Mike
 */

// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler')
  , session = require('express-session'),
  MySQLStore = require('express-mysql-session')(session),
  crypto = require('crypto');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

//===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 =====//
var mysql = require('mysql');

//===== MySQL 데이터베이스 연결 설정 =====//
var pool      =    mysql.createPool({
   connectionLimit : 10, 
   //connectTimeout  : 60 * 60 * 10000,
    //acquireTimeout  : 60 * 60 * 10000,
   //timeout         : 60 * 60 * 10000,
   acquireTimeout: 30000,
    host     : 'localhost',
    user     : 'root',
    password : '5643',
   database : 'project',
   port    :  null,
    debug    :  false
});
// 익스프레스 객체 생성
var app = express();

// 설정 파일에 들어있는 port 정보 사용하여 포트 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, '/public')));

// app.set('view engine', 'ejs');
// app.set('views', './views');


app.use(session({
   secret : '1234',
   stort : new MySQLStore(pool),
   resave: false,
   saveUninitialized : false
}));


//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
var router = express.Router();




router.route('/login').get(function(req, res){
   if(!req.session.name){
      res.redirect('public/login2.html')
   }
   else{
      res.redirect('public/welcome.html');
   }
});


router.route('/welcome').get(function(req, res){
      res.redirect('public/welcome.html');
});

router.route('/logout').get(function(req, res){
   req.session.destroy(function(err){
      res.redirect('public/login2.html');
   });
});

// 로그인 처리 함수
router.route('/process/login').post(function(req, res) {
   console.log('/process/login 호출됨.');

   // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
   
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
   
    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
   if (pool) {
      authUser(paramId, paramPassword)
      .then((result)=>{
         req.session.name=paramId;
         req.session.save(function(){
            return res.redirect('/welcome');
         });
      })
      .catch((message)=>{
         res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
         res.write('<h1>로그인  실패</h1>');
         res.write('<div><p>'+message+'</p></div>');
         res.write("<br><br><a href='/public/login2.html'>다시 로그인하기</a>");
         res.end();

      });
   } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h2>데이터베이스 연결 실패</h2>');
      res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
      res.end();
   }
   
});


// 사용자 추가 라우팅 함수
router.route('/process/adduser').post(function(req, res) {
   console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    
    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
   if (pool) {
      addUser(paramId, paramName, paramPassword)
      .then((addedUser)=> {
         // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송

            console.dir(addedUser);
            console.log('inserted ' + addedUser.affectedRows + ' rows');

            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 성공</h2>');
				res.end();
      })
      .catch(()=> {
         return res.redirect('public/adduser2.html');
      });
   } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
      res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
      res.write('<h2>데이터베이스 연결 실패</h2>');
      res.end();
   }
   
});


// 라우터 객체 등록
app.use('/', router);

//로그인 인증 함수
var authUser = function(id, password) {
   return new Promise(function(resolve, reject){
      pool.getConnection(function(err, conn) {
         if (err) {
            if (conn) {
                 conn.release();  // 반드시 해제해야 함
             }
             callback(err, null);
             return;
         }   
         console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
           
       // SQL 문을 실행합니다.
       console.log(password);
      conn.query("select * from person where id = ?", [id], function(err, rows) {

         if(!rows[0]){
            reject('일치하는 아이디가 없습니다.');
         }
         else{
            crypto.randomBytes(64, (err, buf) => {
               console.dir(rows);
               crypto.pbkdf2(password, rows[0].salt, 100000, 64, 'sha512', (err, key) => {
                  
                  if(err){
                     reject('error 발생');
                  }
  
                  if(key.toString('base64')==rows[0].password)
                    resolve(rows[0]);
                  else
                     reject('비밀번호가 일치하지 않습니다.');
                 });
            });//crypto
         }
     });
   });
});
};
 

//사용자를 등록하는 함수
var addUser = function(id, name, password) {

   return new Promise(function(resolve, reject){  
   console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);
   pool.getConnection(function(err, conn) {
      if (err) {
         if (conn) {
              conn.release(); 
          }
          
          callback(err, null);
          return;
      }   
      console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

            crypto.randomBytes(64, (err, buf) => {
               crypto.pbkdf2(password, buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
                  data = {id:id, password:key.toString('base64'), salt:buf.toString('base64'), name:name};
                  exec = conn.query('insert into person set ?', data, (err, result)=>{
                     conn.release(); 
                     if(err){
                        reject();
                     }
                     else{
                     resolve(result);
                  }});                  
            })
         })
      });
   });


         };




// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
});

app.on('close', function () {
   console.log("Express 서버 객체가 종료됩니다.");
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});
 