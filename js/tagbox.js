var tagbox = angular.module('tagBox', []);

tagbox.directive('tagbox', function() {
	return {
        restrict: 'E',
		scope: {
			tags: '=ngModel',
			autocomplete: '=',
			placeholder: "@"
		},
		template: '<span ng-repeat="tag in tags"><span class="radius label" ng-class="{selected: $index == selectedtag}" ng-click="selectTagByIndex($index)">{{tag}} <a ng-click="removeTagByIndex($index)">&#x2716;</a></span></span><input type="text" placeholder="{{placeholder}}" ng-model="data" typeahead="item for item in autocomplete | filter:$viewValue | limitTo:8" typeahead-on-select="addTag(data); data=\'\'">',
		link: function(scope, tagbox, attrs, controller) {
			var input = angular.element(tagbox.find('input')[0]);

			tagbox.addClass('tagbox');

			if (!(scope.autocomplete)) {
				scope.autocomplete = []
			}
			scope.data = "";
			scope.selectedtag = -1;

			scope.removeTagByIndex = function(index, back) {
				scope.tags.splice(index, 1);
				if (index < scope.selectedtag) {
					scope.selectedtag = scope.selectedtag - 1;
					if (scope.selectedtag < 0 && scope.tags.length > 0) {
						scope.selectedtag = 0;
					}
				}
				else if (index == scope.selectedtag) {
					if (back == true) {
						scope.selectedtag = scope.selectedtag - 1;
						if (scope.selectedtag < 0 && scope.tags.length > 0) {
							scope.selectedtag = 0;
						}
					}
					if (scope.selectedtag > scope.tags.length - 1) {
						scope.selectedtag = -1;
					}
				}
			}

			scope.selectTagByIndex = function(index) {
				scope.selectedtag = index;
				input[0].selectionStart = 0;
				input[0].focus();
			}

			scope.addTag = function(tag) {
				tag = tag.trim();
				scope.selectedtag = -1;

				if ((scope.tags.indexOf(tag) > -1) || (tag == ''))
					return;

				scope.tags.push(tag);
			};

			input.on('keypress', function(event) {
				scope.$apply(function() {
					if (event.key == "Enter" || event.key == " ")
					{
						scope.addTag(scope.data);
						scope.data = "";
						event.preventDefault();
					}
					else if ((event.key == "Backspace" || event.key == "Delete") && input[0].selectionStart == 0)
					{
						if (scope.selectedtag >= 0) {
							scope.removeTagByIndex(scope.selectedtag, event.key == "Backspace");
						} else {
							scope.removeTagByIndex(scope.tags.length - 1);
						}
						event.preventDefault();
					}
					else if (event.key == "ArrowLeft" && input[0].selectionStart == 0)
					{
						if (scope.selectedtag == -1) {
							scope.selectedtag = scope.tags.length -1;
						}
					else if (scope.selectedtag == 0) {
							scope.selectedtag = 0;
						}
						else {
							scope.selectedtag = scope.selectedtag - 1;
						}
						event.preventDefault();
					}
					else if (event.key == "ArrowRight" && scope.selectedtag < scope.tags.length && scope.selectedtag >= 0)
					{
						if (scope.selectedtag == scope.tags.length - 1) {
							scope.selectedtag = -1;
						}
						else {
							scope.selectedtag = scope.selectedtag + 1;
						}
						event.preventDefault();
					}
					else
					{
						scope.selectedtag = -1;
					}
				});
            });

			scope.timer = null;

			input.on('focus', function(event) {
                tagbox.addClass('focus');

				if (scope.timer) {
					window.clearTimeout(scope.timer);
				}
            });

            input.on('blur', function(event) {
				tagbox.removeClass('focus');

				scope.timer = window.setTimeout(function () {
					scope.$apply(function() {
						scope.addTag(scope.data);
						scope.data = "";
					});
				}, 100);
            });
		}
	};
});
