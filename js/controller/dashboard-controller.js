
thumb.controller('upload-controller',['$scope','$state',"Upload","init",function($scope,$state,Upload,init){
	
	if(!init.data.isUserLoggedIn){
		$state.transitionTo("login");
	}
	$scope.maxHeight = 640;
	$scope.maxWidth = 480;
	$scope.uploadFile = function(){
		if(!$scope.maxHeight || !$scope.maxWidth){
			$.notify(
				"Dimension cannot be more than 640x480", 
				"error"
			  );
			  return;
		}

		if(!$scope.file){
			$.notify(
				"Please select a file to upload", 
				"error"
			  );
			  return;
		}
		$scope.upload($scope.file)
	}

	$scope.$watch("file",function(){
		$scope.progress = 0;
	})

	$scope.progress = 0;
	$scope.upload = function (file) {
        Upload.upload({
            url: 'uploadFileToS3',
            data: {file: file, 'username': $scope.username , maxHeight:$scope.maxHeight,maxWidth:$scope.maxWidth}
        }).then(function (resp) {
			console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
			$.notify(
				"File uploaded successfully", 
				"success"
			  );
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
			$scope.progress = progressPercentage;
        });
    };
	
}]);

thumb.controller('dashboard-controller',['$scope','User','$state','init',function($scope,User,$state,init){
	if(!init.data.isUserLoggedIn){
		$state.transitionTo("login");
	}
	var param = {
		startIndex : 0
	}
	User.getListOfImages(param).then(function(response){
		console.log(response);
		$scope.images = response.data.result;
	})
}]);
thumb.controller('register-controller',['$scope','User','$state',function($scope,User,$state){
	
	$scope.loginStatus = "Register here..";
	
	$scope.userObject = {
		
	}

	$scope.validateAndSubmitForm = function(){
		$scope.loginStatus = "Checking Info...";
		
		if($scope.userObject.firstName === null || $scope.userObject.firstName === undefined || $scope.userObject.firstName.length === 0){
		//	$.notify("Access granted", "success");
			$(".name").notify(
					  "Name is requried!!", 
					  { position:"bottom left" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
			
		}
		if($scope.userObject.secondName === null || $scope.userObject.secondName === undefined || $scope.userObject.secondName === 0){
			
			$(".sname").notify(
					  "Second Name is requried!!", 
					  { position:"bottom left" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
			
		}
		if($scope.userObject.email === null || $scope.userObject.email === undefined || $scope.userObject.email.length === 0){
			
			$(".email").notify(
					  "Last Name is requried!!", 
					  { position:"bottom left" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
	
		}
		if($scope.userObject.password === null || $scope.userObject.password === undefined || $scope.userObject.password.length === 0){
			
			$(".pass").notify(
					  "Password is requried!!", 
					  { position:"bottom left" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
	
		}
		if($scope.userObject.confirmPassword === null || $scope.userObject.confirmPassword === undefined || $scope.userObject.confirmPassword.length === 0){
			
			$(".rpass").notify(
					  "Confirm Passwrod is requried!!", 
					  { position:"bottom left" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
	
		}
		
		if($scope.userObject.confirmPassword !== $scope.userObject.password){
			
			$(".repass").notify(
					  "Password doenst Match!!", 
					  { position:"bottom right" },
					  "error"
					);
			$scope.loginStatus = "Register here..";
			return;
		}
		
		User.registerUser($scope.userObject).then(function(response){
			var resp = response.data;
			if(resp.status == "success"){		
				$.notify("Account Created Successfully!!", "success");
				$state.transitionTo("login");
			}
			else{
				$.notify("Failed to create account!!", "error");
			}
		})
		
	}
	
}]);

thumb.controller('login-controller',["$scope","User","$state","init",function($scope,User,$state,init){
	
	if(init.data.isUserLoggedIn){
		$state.transitionTo("upload");
	}
	$scope.isError = false;
	$scope.loginStatus = "Login..."
	
	$scope.loginUser = function(){
		$scope.loginStatus = "Authenticating..";
		$scope.isError = false;
		var userObj = {
				email :  $scope.userName,
				password : $scope.password
		}
		
		if(userObj.email === null || userObj.email === undefined || userObj.email.length === 0){
			$.notify("Please recheck username and password you have entered!!", "error");
			$scope.loginStatus = "Login..."
			return;
			
		}
		if(userObj.password === null || userObj.password === undefined || userObj.password.length === 0){
			$.notify("Please recheck username and password you have entered!!", "error");
			$scope.loginStatus = "Login..."
			return;
		}
		User.loginUser(userObj).then(function(response){
			var resp = response.data;
			if(resp.status == "success"){
				$state.transitionTo("upload");	
			}
			else{
				$scope.loginStatus = "Login..."
				$scope.isError = true;
				$.notify("Please recheck username and password you have entered!!", "error");
			}
			
		}).then(function(response){
			$scope.loginStatus = "Login..."
		})
	}
	$scope.registerUser = function(){
		$state.transitionTo("register");
	}
	
}]);

thumb.controller('root-controller',["$scope","init",function($scope,init){
	if(init.data.isUserLoggedIn){
		$state.transitionTo("upload");
	}
}])



thumb.controller('navigation-controller',["$scope","User","$state",function($scope,User,$state){

	$(function(){
		$('.modal').modal({
		      dismissible: true, // Modal can be dismissed by clicking outside of the modal
		      opacity: .5, // Opacity of modal background
		      inDuration: 300, // Transition in duration
		      outDuration: 200, // Transition out duration
		      startingTop: '4%', // Starting top style attribute
		      endingTop: '10%'
		}// Ending top style attribute
		  );
		
		$scope.modalStyle = {
				width:'40%'
		}
		
	})
	
	$scope.performLogout = function(){
		User.performLogout().then(function(){
			$state.transitionTo("login");
		})
	}

	$scope.closePopup = function(){
		$('#modal1').modal('close');
	}

	$scope.navigateToUpload = function(){
		$state.transitionTo("upload");
	}
	$scope.navigateToDashBoard = function(){
		$state.transitionTo("dashboard");
	}

	$scope.navigateToRegister = function(){
		$state.transitionTo("register");
	}
	$scope.navigateToLogin = function(){
		$state.transitionTo("login");
	}
	$scope.showAboutUS = function(){
		$('#modal1').modal('open');
	}
	
}]);

thumb.controller('landing-navigation-controller',["$scope","User","$state",function($scope,User,$state){

	$(function(){
		$('.modal').modal({
		      dismissible: true, // Modal can be dismissed by clicking outside of the modal
		      opacity: .5, // Opacity of modal background
		      inDuration: 300, // Transition in duration
		      outDuration: 200, // Transition out duration
		      startingTop: '4%', // Starting top style attribute
		      endingTop: '10%'
		}// Ending top style attribute
		  );
		
		$scope.modalStyle = {
				width:'40%'
		}
		
	})
	
	$scope.performLogout = function(){
		User.performLogout().then(function(){
			$state.transitionTo("login");
		})
	}
	
	$scope.openSettings = function(){
		$state.transitionTo("settings");
	}
	
	$scope.navigateToDashBoard = function(){
		$('#modal1').modal('open');
	}

	$scope.navigateToLogs = function(){
		$('#modal2').modal('open');
	}
}]);

