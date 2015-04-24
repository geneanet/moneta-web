var monetaFilters = angular.module('monetaFilters', []);

monetaFilters.filter('taskfilter', function ($filter) {
	return function(items, expression) {
		if (!expression) {
			return items;
		}

		expression = expression.toLowerCase().split(" ")

		var result = {};

		function match_tag(task, tag)
		{
			for (var t = 0; t < task.tags.length; t++)
			{
				if (task.tags[t].toLowerCase().indexOf(tag) > -1)
					return true;
			}

			return false;		
		}

		function match_title(task, title)
		{
			return task.name.toLowerCase().indexOf(title) > -1;
		}

		function xor(a,b)
		{
			return ( a || b ) && !( a && b );
		}

		angular.forEach(items, function(task, taskid) {
			for (var i = 0; i < expression.length; i++)
			{
				var item = expression[i];

				var negate = false;
				if (item[0] == '-')
				{
					negate = true;
					item = item.substr(1);
				}
				
				if (item.lastIndexOf('tag:', 0) === 0)
				{
					item = item.substr(4);

					if (xor(negate, !match_tag(task, item)))
						return;
				}
				else if (item.lastIndexOf('title:', 0) === 0)
				{
					item = item.substr(6);
					if (xor(negate, !match_title(task, item)))
						return;
				}
				else 
				{
					if (xor(negate, !(match_title(task, item) || match_tag(task, item))))
						return;
				}
			}

			result[taskid] = task;
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

monetaFilters.filter('formatDuration', function() {
	return function(duration) {
		return moment.duration(duration * 1000).humanize();
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
