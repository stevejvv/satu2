app.directive('roomForm', function () {
      return {
            restrict: 'EA',
            transclude: false,
            templateUrl: 'views/templates/roomForm.html',
            scope: {
                  roomTypes : "=",
                  connected : "=",
                  roomAdd: "&"
            },
            link: function (scope, element, attrs) {
            }
      }
});

app.directive('roomSection', function () {
      return {
            restrict: 'EA',
            transclude: false,
            templateUrl: 'views/templates/rooms.html',
            scope: {
                  roomList: "=",
                  roomTypes: "=",
                  clientTypes: "=",
                  selfId: "=",
                  connected: "=",
                  roomDel: "&",
                  roomConnect: "&"

            },
            link: function (scope, element, attrs) {
            }
      }
});