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

monetaServices.factory('alert', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	function deleteAlert(alert) {
		alerts = $rootScope.alerts;
		alerts.splice(alerts.indexOf(alert), 1);
	}

	function addAlert(alert) {
		if (alert['type'] === undefined) {
			alert['type'] = 'info';
		}

		if (alert['closable'] === undefined) {
			alert['closable'] = true;
		}

		if ($rootScope.alerts === undefined) {
			$rootScope.alerts = [];
		}

		if (alert['timeout'] > 0) {
			$timeout(function() {
				deleteAlert(this);
			}, alert['timeout']);
		}

		$rootScope.alerts.push(alert);

		return alert;
	}

	return {
		'add': addAlert,
		'delete': deleteAlert
	};
}]);

monetaServices.factory('clusterconfig', ['$http', 'alert', 'config', '$q', function($http, alert, config, $q) {
	var deferred = $q.defer();

	$http.get(config.backend + '/plugins').success(function(data, status, headers) {
		plugins = {};

		data.forEach(function(value, index, array) {
			plugins[value] = true;
		});

		deferred.resolve({
			plugins: plugins
		});
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching the plugins list, please try again !'});
		deferred.reject('An error occured while fetching the plugins list, please try again !');
	});

	return deferred.promise;
}]);
