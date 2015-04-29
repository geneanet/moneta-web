var monetaServices = angular.module('monetaServices', []);

monetaServices.factory('config', ['$location', function($location) {
	function getQueryVariable(variable) {
	    var query = window.location.search.substring(1);
	    var vars = query.split('&');
	    for (var i = 0; i < vars.length; i++) {
	        var pair = vars[i].split('=');
	        if (decodeURIComponent(pair[0]) == variable) {
	            return decodeURIComponent(pair[1]);
	        }
	    }
	    console.log('Query variable %s not found', variable);
	}

	backend = getQueryVariable('backend')
	
	if (!backend) {
		if (window.moneta_backend) {
			backend = window.moneta_backend;
		}
		else {
			backend = "http://127.0.0.1:32000";
		}
	}

	return {
		'backend': backend
	};
}]);