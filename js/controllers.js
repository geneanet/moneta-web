var monetaControllers = angular.module('monetaControllers', ['monetaServices']);

monetaControllers.controller('ModalDialogCtrl', [ '$scope', '$modalInstance', 'message', 'title', function ($scope, $modalInstance, message, title) {
	$scope.message = message;
	$scope.title = title;

	$scope.ok = function () {
		$modalInstance.close();
	};
}]);

monetaControllers.controller('ClusterStatusCtrl', ['$scope', '$http', 'config', function ($scope, $http, config) {
	$http.get(config.backend + '/cluster/status').success(function(data, status, headers, config) {
		$scope.cluster = data;
	});
}]);

monetaControllers.controller('TaskListCtrl', ['$scope', '$http', 'config', function ($scope, $http, config) {
	$scope.tagfilter = '!template'

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		$scope.tasks = data;
	});

	$scope.enableTask = function(taskId) {
		if ($scope.tasks[taskId].enabled)
			action = "enable";
		else
			action = "disable";

		$http.post(config.backend + '/tasks/' + taskId + '/' + action).error(function(data, status, headers, config) {
				alert('Fail !')
			});
	};

}]);

monetaControllers.controller('TaskEditCtrl', ['$scope', '$http', '$routeParams', '$location', '$modal', 'config', function ($scope, $http, $routeParams, $location, $modal, config) {

	modalOkDialog = function(title, message, callback = null) {
		var modalInstance = $modal.open({
			templateUrl: 'templates/modal-ok.html',
			controller: 'ModalDialogCtrl',
			backdrop: 'static',
			resolve: {
				title: function () { return title; },
				message: function () { return message; }
			}
		});

		modalInstance.result.then(function (result) {
			if (callback)
				callback()
		});
	};


	$scope.removeEnv = function(env) {
		delete $scope.task.env[env];
	};

	$scope.setEnv = function(env, value) {
		env = env.trim();

		if (env == '')
			return;

		$scope.task.env[env] = value;
	};

	$scope.removeTag = function(tag) {
		var index = $scope.task.tags.indexOf(tag);
		$scope.task.tags.splice(index, 1);
	};

	$scope.addTag = function(tag) {
		tag = tag.trim();

		if (($scope.task.tags.indexOf(tag) > -1) || (tag == ''))
			return;

		$scope.task.tags.push(tag);
	};

	$scope.removePool = function(pool) {
		var index = $scope.task.pools.indexOf(pool);
		$scope.task.pools.splice(index, 1);
	};

	$scope.addPool = function(pool) {
		pool = pool.trim();

		if (($scope.task.pools.indexOf(pool) > -1) || (pool == ''))
			return;

		$scope.task.pools.push(pool);
	};

	$scope.removeSchedule = function(index) {
		$scope.task.schedules.splice(index, 1);
	};

	$scope.addSchedule = function(schedule) {
		$scope.task.schedules.push(schedule);
	};

	$scope.removeEMail = function(index) {
		$scope.task.mailto.splice(index, 1);
	};

	$scope.addEMail = function(email) {
		$scope.task.mailto.push(email);
	};

	$scope.saveTask = function() {
		if ($scope.taskId == 'new') {
			$http.post(config.backend + '/tasks', $scope.task)
				.success(function(data, status, headers, config) {
					modalOkDialog('The task has been created.', '', function () { $location.path('/tasks'); });
				}).error(function(data, status, headers, config) {
					modalOkDialog('An error occured !', 'Please try again.');
				});
		} else {
			$http.put(config.backend + '/tasks/' + $scope.taskId, $scope.task)
				.success(function(data, status, headers, config) {
					modalOkDialog('The task has been saved.', '', function () { $location.path('/tasks'); });
				}).error(function(data, status, headers, config) {
					modalOkDialog('An error occured !', 'Please try again.');
				});
		}
	};

	$scope.deleteTask = function() {
		$http.delete(config.backend + '/tasks/' + $scope.taskId, $scope.task)
			.success(function(data, status, headers, config) {
				modalOkDialog('The task has been deleted.', '', function () { $location.path('/tasks'); });
			}).error(function(data, status, headers, config) {
				modalOkDialog('An error occured !', 'Please try again.');
			});
	};

	$scope.taskId = $routeParams.taskId

	if ($scope.taskId == 'new') {
		if ($routeParams.templateId) {
			$http.get(config.backend + '/tasks/' + $routeParams.templateId).success(function(data, status, headers, config) {
				$scope.task = data;
				$scope.task.name = ""
				$scope.task.description = ""
				$scope.removeTag('template')
			}).error(function(data, status, headers, config) {
				modalOkDialog('An error occured while fetching the template !', 'Please try again.');
			});
		} else {
			$scope.task = {
				'tags': [],
				'env': {},
				'schedules': [],
				'mailto': [],
				'mode': 'any',
				'pools': [ 'default' ],
				'mailreport': 'never'
			}
		}
	} else {
		$http.get(config.backend + '/tasks/' + $routeParams.taskId).success(function(data, status, headers, config) {
			$scope.task = data;
		}).error(function(data, status, headers, config) {
			modalOkDialog('An error occured while fetching the task !', 'Please try again.');
		});
	}

	$http.get(config.backend + '/tags').success(function(data, status, headers, config) {
		$scope.tags = data;
	});

	$http.get(config.backend + '/cluster/pools').success(function(data, status, headers, config) {
		$scope.pools = Object.keys(data);
	});

}]);



