var Express = require('express');
var app = Express();
var path = require('path');
var session = require('express-session'); //Session Handling
var Matrix = require('crypto') ; //Generating Random Secure token
var formidable = require('formidable'); //For parsing attachments
var config = require('./config.json')
const fileUpload = require('express-fileupload');
const AWS = require('aws-sdk');
const fs = require("fs");
 /* AWS.config.update({
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'region'
  }); */

var s3 = new AWS.S3();
const FILE_PERMISSION = 'public-read'
//XSS Attack , sanitization
var createDOMPurify = require('dompurify');
var jsdom = require('jsdom');
var window = jsdom.jsdom('', {
  features: {
    FetchExternalResources: false, // disables resource loading over HTTP / filesystem
    ProcessExternalResources: false // do not execute JS within script blocks
  }
}).defaultView;
var DOMPurify = createDOMPurify(window);

//Multipart data parsing
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//MySQL Dependency
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : config.mysqlHost, //Add your host here
  user     : config.mysqlUserName, // MySql username
  password : config.mysqlPassword, // MySql Password
  database : config.mysqlDatabase // Database
});

//Initialize kafka
var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'}),
    producer = new Producer(client);

//To enable static files to be served by express
app.use(Express.static('js'));
app.use(Express.static('images'));
app.use(Express.static('css'));
app.use(Express.static('views'));
app.use(Express.static('node_modules'));
app.use(Express.static('uploads'));
app.use(Express.static('./'));

//Session Handling for Authentication
var sessionOptions = {
		  cookieName: 'session',
		  secret: 'vily_mily_goes_here',
		  duration: 30 * 60 * 1000,
		  activeDuration: 5 * 60 * 1000,
		  resave : true,
		  saveUninitialized : false
}
app.use(session(sessionOptions));


var userTokenMap = {};

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.post('/login', function(req, res){
	loginUser(req,res);
});

app.post('/getListOfImages',function(req,res){
	getListOfImages(req,res);
});

app.post('/performLogout',function(req,resp){
	performLogout(req,resp);
})

app.post('/uploadFileToS3',function(req,resp){
	uploadFileToS3(req,resp);
})

app.post('/register',function(req,resp){
	registerUser(req,resp);
})

app.listen(config.serverport, function(){
	  console.log('listening on *:'+config.serverport);
});

app.post('/isUserLoggedIn',function(req,res){
	isUserLoggedIn(req,res);
});

app.post('/performLogout',function(req,resp){
	performLogout(req,resp);
})
var isUserLoggedIn = function(req,res){
	
	var status = isRequestValid(req);
	res.json({"isUserLoggedIn":status});
}

var isRequestValid = function(request){
	try {
		var userId = request.session.userId;
		var tokenFromSession = request.session.token;
		if (!userId || !tokenFromSession)
			return false;
		var tokenFromServer = userTokenMap[userId];
		if (tokenFromServer === tokenFromSession) {
			return true
		}
	} catch (e) {
		console.log("Exception : "+e.stack);
	}
	return false;
}
var registerUser = function(req,res){

    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var secondName = req.body.secondName;

    var query = "INSERT INTO USERS(`firstName`,`secondName`,`email`,`password`) VALUES(?, ?, ?, ?)";
    var formattedQuery = mysql.format(query,[firstName,secondName,email.toLocaleLowerCase(),password]);

    connection.query(formattedQuery,function(error,results){
        if (error){
            res.send({
                status: "error",
                message : "Error While Registration!!"
            });
        }
        else{
            res.send({
                status : "success",
                message: "User Registered Successfully!!"
            })
        }
        
    })

}
var uploadFileToS3 = function(req,res){
    if (req.files && Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    if(!isRequestValid(req)){
        res.send({
            "status":"error",
            "message": "User not logged in"
        });
        return;
    }
    var height = req.body.maxHeight;
    var width = req.body.maxWidth;
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile =  req.files.file;
      let key = sampleFile.name;
      console.log("File Received Successfully "+key);
      sampleFile.mv('/tmp/'+key,function(){
        fs.readFile( '/tmp/'+key, function (err, data) {
            if (err) { throw err; }
            res.send({
                "message": "ok"
            });
               params = {Bucket: "originals-upload", Key: key, Body: data, ACL: FILE_PERMISSION };
               s3.putObject(params, function(err, data) {
                   if (err) {
                       console.log(err)
                   } else {
                       console.log("Successfully uploaded data to myBucket/myKey");
                       var userId = req.session.userId;
                       insertFileToDB(userId,key,height,width);
                   }
                });
          });
      })
      
}

var getListOfImages = function(req,res){

    if(!isRequestValid(req)){
        res.send({
            "status":"error",
            "message": "User not logged in"
        });
        return;
    }

    var index = req.body.startIndex
    console.log("Index is "+index);
    var userId = req.session.userId;
    var pageSize = 30;
    var query = "Select original_image from PROCESSED_IMAGES where userId = ? limit ?,?";
    var formattedQuery = mysql.format(query,[parseInt(userId),parseInt(index),pageSize]);
    connection.query(formattedQuery,function(error,results){
        if (error) throw error;
        res.send({result : results});
    })
}

var insertFileToDB = function(userId,fileName,height,width){

    var query = "INSERT INTO PROCESSED_IMAGES(`userId`,`original_image`,`processed_image`,`status`) VALUES(?, ?, ?, ?)";
    var formattedQuery = mysql.format(query,[parseInt(userId),fileName,"","PROCESSING"]);

    connection.query(formattedQuery,function(error,results){
        if (error) throw error;
        var insertedId = results.insertId;
        sendMessageToKafka(fileName,insertedId,height,width)
    })
}

var sendMessageToKafka = function(fileName,rowId,height,width){
    var message = {
        s3Path : fileName,
        row_id : rowId,
        resize_height: height,
        resize_width : width
    }
    var payloads = [{
         topic: 'image-reader', messages: JSON.stringify(message), partition: 0 
    }]
    producer.send(payloads, function (err, data) {
        if(err){
            throw err;
        }
        console.log(data);
    });
}
function loginUser(req,res){
	try{
	console.log(req.body);
	
	var loginId = req.body.email;
	var password = req.body.password;
	
	
	if(loginId === null && loginId === undefined && loginId.length === 0){
		res.send({status:"error",cause:"Username and password mandatory!!"});
	}
	if(password === null && password === undefined && password.length === 0){
		res.send({status:"error",cause:"Username and password mandatory!!"});
	}
	
	var userName = DOMPurify.sanitize(req.body.email);
	//connection.connect();
	
	var query = "SELECT * FROM USERS WHERE email = ?";
	var formattedQuery = mysql.format(query,[userName]);
	
	connection.query(formattedQuery,function(err,result){
		console.log(result);
		if(err){
			console.log(err);
		}
		else{
			if(result.length === 0){
				res.json({status:"error",cause:"Invalid user name!!"});
				return;
			}
			var passwordFromDB = result[0].password;
			
			if(password === passwordFromDB){
				userData = {
						userName : result[0].firstName,
						userId : result[0].id,
						status : "success"
				}
				
				var token = Matrix.randomBytes(64).toString('hex');
				
				req.session.token = token;
				req.session.userId = result[0].id;
				
				userTokenMap[result[0].id] = token;
				
				res.json({status:"success"});
			}
			else{
				res.json({status:"error",cause:"Incorrect password!!"});
				return;
			}
		}
	});
	}
	catch(e){
		console.log("Exception while loggin user :"+e.stack)
	}
}

function performLogout(request,response){
	try{
		if(isRequestValid(request)){
			var userId = request.session.userId;
            delete userTokenMap[userId];
            delete request.session.userId;
            delete request.session.token;
		}
	}catch(e){
		console.log("Exception : Logout :"+e.stack);
	}
	response.json({status:"success"});
}

function isUserLoggedIn(req,res){
	
	var status = isRequestValid(req);
	res.json({"isUserLoggedIn":status});
}

function isRequestValid(request){
	try {
		var userId = request.session.userId;
		var tokenFromSession = request.session.token;
		if (!userId || !tokenFromSession)
			return false;
		var tokenFromServer = userTokenMap[userId];
		if (tokenFromServer === tokenFromSession) {
			return true
		}
	} catch (e) {
		console.log("Exception : "+e.stack);
	}
	return false;
}



//Size Conversion
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i]; 
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};
//get file name from server file path
function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1);     
   return base;
}
