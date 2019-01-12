thumb.factory('User',["$http","$httpParamSerializerJQLike",function($http,$httpParamSerializerJQLike){
	var User = {
			
	}
	
	var reqObject = {
			method : 'POST',
			headers: {
			    'Content-Type': 'application/x-www-form-urlencoded' // Note the appropriate header
			  }
	};
	
	User.getListOfImages = function(userObject){

		reqObject.method = 'POST';
		reqObject.url = "getListOfImages";
		reqObject.data =$httpParamSerializerJQLike({
			startIndex : userObject.startIndex
		});
		
		return $http(reqObject).then(function(response){
			return response;
		});
	}

	User.registerUser = function(userObject){

		reqObject.method = 'POST';
		reqObject.url = "register";
		reqObject.data =$httpParamSerializerJQLike({
			firstName : userObject.firstName,
			secondName : userObject.secondName,
			email : userObject.email,
			password : userObject.password
		});
		
		return $http(reqObject).then(function(response){
			return response;
		});
	}

	User.loginUser = function(userObject){

		reqObject.method = 'POST';
		reqObject.url = "login";
		reqObject.data =$httpParamSerializerJQLike({
			email: userObject.email.toLowerCase(),
			password : userObject.password
		});
		
		return $http(reqObject).then(function(response){
			return response;
		});
	}

	User.isUserLoggedIn = function(userData){
		reqObject.method = 'POST';
		reqObject.url = "/isUserLoggedIn";
		
		reqObject.data =$httpParamSerializerJQLike( {
			"type":"isUserLoggedIn"
		});
		
		return $http(reqObject).then(function(response){
			return response;
		});
	}

	User.performLogout = function(){
		reqObject.method = 'POST';
		reqObject.url = "/performLogout";
		reqObject.data =$httpParamSerializerJQLike( {
			 type : "loggedOutUser"
		});
		
		return $http(reqObject).then(function(response){
			return response;
		});
	}

	return User;
	
}]);