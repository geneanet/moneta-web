var monetaControllers = angular.module('monetaControllers', ['monetaServices']);

monetaControllers.controller('ModalDialogCtrl', [ '$scope', '$modalInstance', 'message', 'title', function ($scope, $modalInstance, message, title) {
	$scope.message = message;
	$scope.title = title;

	$scope.ok = function () {
		$modalInstance.close();
	};
}]);

monetaControllers.controller('ClusterStatusCtrl', ['$scope', '$http', 'config', function ($scope, $http, config) {
	$http.get(config.backend + '/cluster/status').success(function(data, status, headers, httpconfig) {
		$scope.cluster = data;
		$scope.processes = {}

		angular.forEach($scope.cluster['nodes'], function(value, key) {
			$http.get(config.backend + '/node/' + key + '/status').success(function(data, status, headers, httpconfig) {
				$scope.cluster['nodes'][key]['status'] = data

				angular.forEach(data['running_processes'], function(value, key) {
					$scope.processes[key] = {
						'node': data['name'],
						'started': value['started'],
						'task': value['task']
					}
				});
			});
		});
	});

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		$scope.tasks = data;
	});
}]);

monetaControllers.controller('NodeStatusCtrl', ['$scope', '$http', '$stateParams', 'config', function ($scope, $http, $stateParams, config) {
	$http.get(config.backend + '/node/' + $stateParams.node + '/status').success(function(data, status, headers, config) {
		$scope.node = data;
	});

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		$scope.tasks = data;
	});
}]);

monetaControllers.controller('TaskListCtrl', ['$scope', '$http', '$stateParams', '$location', '$window', 'config', function ($scope, $http, $stateParams, $location, $window, config) {
	$scope.tagfilter = '!template'

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		arraydata = [];

		angular.forEach(data, function(task, taskid) {
			task['id'] = taskid;
			arraydata.push(task);
		});


		$scope.tasks = arraydata;
	});

	$http.get(config.backend + '/plugins').success(function(data, status, headers) {
		$scope.plugins = data;

		if (data.indexOf('executionsummary') > -1) {
			$http.get(config.backend + '/executionsummary').success(function(data, status, headers) {
				$scope.executionsummary = data;
			});
		}
	});

	$scope.enableTask = function(task) {
		if (task.enabled)
			action = "enable";
		else
			action = "disable";

		$http.post(config.backend + '/tasks/' + task.id + '/' + action).error(function(data, status, headers, config) {
				alert('Fail !')
			});
	};

	$scope.filter = $stateParams.filter;
	$scope.$watch('filter', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$location.search('filter', newVal);
			$scope.currentpage = 0;
		}
	});

	$scope.currentpage = ($stateParams.page > 0) ? $stateParams.page - 1 : 0;
	$scope.$watch('currentpage', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$location.search('page', newVal + 1);
		}
	});

	$scope.tasksperpage = 25;

	$scope.changePage = function(page) {
		$scope.currentpage = page;
		$window.scrollTo(0,0);
	};

	$scope.$watch('tagfilter', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$scope.currentpage = 0;
		}
	});
}]);

monetaControllers.controller('TaskEditorCtrl', ['$scope', '$http', 'config', function ($scope, $http, config) {
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

	$http.get(config.backend + '/tags').success(function(data, status, headers, config) {
		$scope.tags = data;
	});

	$http.get(config.backend + '/cluster/pools').success(function(data, status, headers, config) {
		$scope.pools = Object.keys(data);
	});
}]);


monetaControllers.controller('TaskEditCtrl', ['$scope', '$http', '$stateParams', '$state', '$location', '$modal', 'config', function ($scope, $http, $stateParams, $state, $location, $modal, config) {
	modalOkDialog = function(title, message, callback) {
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


	$scope.tabs = [
		{ heading: "Edit", route:"task.edit", active:true },
        { heading: "Audit Log", route:"task.auditlog", active:false },
	];

   $scope.go = function(route){
       $state.go(route);
   };

   $scope.active = function(route){
       return $state.is(route);
   };

   $scope.$on("$stateChangeSuccess", function() {
       $scope.tabs.forEach(function(tab) {
           tab.active = $scope.active(tab.route);
       });
   });

	$scope.saveTask = function() {
		$http.put(config.backend + '/tasks/' + $scope.taskId, $scope.task)
			.success(function(data, status, headers, config) {
				modalOkDialog('The task has been saved.', '', function () { $location.path('/tasks'); });
			}).error(function(data, status, headers, config) {
				modalOkDialog('An error occured !', 'Please try again.');
			});
	};

	$scope.deleteTask = function() {
		$http.delete(config.backend + '/tasks/' + $scope.taskId, $scope.task)
			.success(function(data, status, headers, config) {
				modalOkDialog('The task has been deleted.', '', function () { $location.path('/tasks'); });
			}).error(function(data, status, headers, config) {
				modalOkDialog('An error occured !', 'Please try again.');
			});
	};

	$scope.taskId = $stateParams.taskId

	$http.get(config.backend + '/tasks/' + $stateParams.taskId).success(function(data, status, headers, config) {
		$scope.task = data;
	}).error(function(data, status, headers, config) {
		modalOkDialog('An error occured while fetching the task !', 'Please try again.');
	});
}]);


monetaControllers.controller('NewTaskCtrl', ['$scope', '$http', '$state', '$stateParams', '$location', '$modal', 'config', function ($scope, $http, $state, $stateParams, $location, $modal, config) {
	modalOkDialog = function(title, message, callback) {
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

	$scope.createTask = function() {
		$http.post(config.backend + '/tasks', $scope.task)
			.success(function(data, status, headers, config) {
				modalOkDialog('The task has been created.', '', function () { $location.path('/tasks'); });
			}).error(function(data, status, headers, config) {
				modalOkDialog('An error occured !', 'Please try again.');
			});
	};

	if ($stateParams.templateId) {
		$http.get(config.backend + '/tasks/' + $stateParams.templateId).success(function(data, status, headers, config) {
			$scope.templateId = $stateParams.templateId;
			$scope.templateName = data.name;
			$scope.task = data;
			$scope.task.name = ""
			$scope.task.description = ""
			$scope.task.tags.splice($scope.task.tags.indexOf('template'), 1);
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
}]);
