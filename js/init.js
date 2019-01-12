
var thumb = angular.module('ease-thumb',['ui.router','angularSpinner','ngFileUpload']);

thumb.directive('usSpinner',   ['$http', '$rootScope' ,function ($http, $rootScope){
    return {
        link: function (scope, elm, attrs)
        {
            
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (loading)
            {
                if(loading){
                    elm.removeClass('ng-hide');
                }else{
                    elm.addClass('ng-hide');
                }
            });
        }
    };

}]);
thumb.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});

$(function(){
	$(".button-collapse").sideNav();	
})
