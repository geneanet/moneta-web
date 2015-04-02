var monetaFilters = angular.module('monetaFilters', []);

monetaFilters.filter('taskfilter', function ($filter) {
	return function(items, expression) {
		if (!expression) {
			return items;
		}

		expression = expression.toLowerCase()

		var result = {};

		angular.forEach(items, function(task, taskid) {
			if (task.name.toLowerCase().indexOf(expression) > -1) {
				result[taskid] = task;
				return;
			}

			angular.forEach(task.tags, function(tag) {
				if (tag.toLowerCase().indexOf(expression) > -1) {
					result[taskid] = task;
					return;
				}
			});
		});

		return result;
	};
});


monetaFilters.filter('taskhastag', function ($filter) {
	return function(items, expression) {
		if (!expression) {
			return items;
		}

		if (expression[0] == "!") {
			negate = true;
			expression = expression.substring(1);
		} else {
			negate = false;
		}

		var result = {};

		angular.forEach(items, function(task, taskid) {
			hastag = task.tags.indexOf(expression) > -1;

			if (!negate && hastag || negate && !hastag) {
				result[taskid] = task;
				return;
			}
		});

		return result;
	};
});


monetaFilters.filter('fromNow', function() {
	return function(date) {
		return moment(date).fromNow();
	}
});

monetaFilters.filter('formatDateTime', function() {
	return function(date) {
		return moment(date).format('llll');
	}
});


monetaFilters.filter('keyLength', function(){
	return function(input){
		if(!angular.isObject(input)) {
			return 0;
		}
		return Object.keys(input).length;
	}
});
