thumb.config(['$stateProvider', '$urlRouterProvider','$httpProvider',function($stateProvider, $urlRouterProvider,$httpProvider) {
	    $urlRouterProvider.otherwise('/login');
	   
	    $stateProvider
		    .state('root', {
	            url:'/',
	            views :{
		        	'navigation' :{
		        		templateUrl: "views/landingnav.html",
		        		controller :'landing-navigation-controller'
		        	},
	            	'container':{
	            		controller : "root-controller"
	            	},
	            	'footer':{
	            		templateUrl: "views/footer.html"
	            	}
				},
				resolve :{
					init : ["User",function(User){
						return User.isUserLoggedIn().then(function(sessionInit){
							return sessionInit;
						});
					}]
				}
	        })
		    .state('login', {
	            url:'/login',
	            views :{
		        	'navigation' :{
						templateUrl: "views/login-nav.html",
		        		controller :'navigation-controller'
		        	},
	            	'container':{
	            		templateUrl: "views/login.html",
	            		controller : "login-controller"
	            	},
	            	'footer':{
	            		templateUrl: "views/footer.html"
	            	}
				},
				resolve :{
					init : ["User",function(User){
						return User.isUserLoggedIn().then(function(sessionInit){
							return sessionInit;
						});
					}]
				}
	        })
	        .state('upload', {
	            url:'/upload',
	            views :{
		        	'navigation' :{
		        		templateUrl: "views/upload_nav.html",
		        		controller :'navigation-controller'
		        	},
	            	'container':{
	            		templateUrl: "views/upload.html",
	            		controller :'upload-controller'
	            	},
	            	'footer':{
						templateUrl: "views/footer.html"
	            	}
				},
				resolve :{
					init : ["User",function(User){
						return User.isUserLoggedIn().then(function(sessionInit){
							return sessionInit;
						});
					}]
				}
	        }).state('dashboard', {
	            url:'/dashboard',
	            views :{
		        	'navigation' :{
		        		templateUrl: "views/navigation.html",
		        		controller :'navigation-controller'
		        	},
	            	'container':{
	            		templateUrl: "views/dashboard.html",
	            		controller :'dashboard-controller'
	            	},
	            	'footer':{
						templateUrl: "views/footer.html"
	            	}
				},
				resolve :{
					init : ["User",function(User){
						return User.isUserLoggedIn().then(function(sessionInit){
							return sessionInit;
						});
					}]
				}
	        })
	        .state('register', {
	            url:'/register',
	            views :{
		        	'navigation' :{
		        		templateUrl: "views/registration-nav.html",
		        		controller :'navigation-controller'
		        	},
	            	'container':{
	            		templateUrl: "views/registration.html",
	            		controller :'register-controller'
	            	},
	            	'footer':{
						templateUrl: "views/footer.html"
	            	}
	            }
	        })
	
	         
	}]);