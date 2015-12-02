

app.controller('MainController', function( $scope, socket, roomService, userService, toaster){
	$scope.rooms = [];
	$scope.selfId = "";
	$scope.connected = false;
	$scope.roomName = '';
	$scope.roomTypes = roomService.roomTypes;
	
	
	//SOCKET COMMUNICATION
	
	socket.on('msgManager',function(data){
		if(data.actionType == 'initial'){ //INITIAL
			if(data.data !== ''){
				userService.selfId = data.data;
				$scope.selfId = userService.selfId;
				console.log('YOU ARE ONLINE');
			}
		}
		if (data.actionType == 'roomStatus') { //ROOM STATUS
			roomService.rooms = data.data;
			$scope.rooms = roomService.rooms;
			for (var i = 0; i < $scope.rooms.length; i++) {
				if($scope.rooms[i].backend == userService.selfId || $scope.rooms[i].satu == userService.selfId || $scope.rooms[i].gluco == userService.selfId || $scope.rooms[i].astrid == userService.selfId){
					$scope.connected = true;
					console.log('YOU ARE CONNECTED TO A ROOM');
					break;
				} 
				else {
					$scope.connected = false;
					console.log('YOU ARE NOT CONNECTED TO A ROOM');
				}
			}
		}
		$scope.$digest();
	});
	
	
	// CREATE A ROOM
	
	$scope.roomAdd = function(myRoom){
		if (typeof myRoom.roomName == 'undefined') {
			$scope.pop('error', 'ERROR', 'Please choose a room name');
			return;	
		}
		if (!myRoom.roomType) {
			$scope.pop('error', 'ERROR', 'Please choose a room type');
			return;	
		}
		for (var i = 0; i < $scope.rooms.length; i++) {
			if($scope.rooms[i].name == myRoom.roomName ){
				console.log('ROOM NAME ALREADY EXISTS');
				$scope.pop('error', 'ERROR', 'The room name you have entered already exists');
				return;
			}
		}
		var data = JSON.parse(JSON.stringify(roomService.roomsTemplate[0])) ;
		data.manager = 'roomManager';
		data.data[0].actionType = 'ADD';
		data.data[0].roomName = myRoom.roomName;
		data.data[0].roomType = myRoom.roomType;
		data.data[0].replyIds = ['ALL'];


		socket.emit('commManager', data);
		console.log('ROOM CREATED');
		$scope.pop('success', 'SUCCESS', myRoom.roomName + ' has been created');
		return;
	}
	
	
	// DELETE A ROOM
	
	$scope.roomDel = function(roomName){
		for (var i = 0; i < $scope.rooms.length; i++) {
			if($scope.rooms[i].name == roomName ){
				if($scope.rooms[i].backend == '' && ($scope.rooms[i].satu == null || $scope.rooms[i].satu == '') && ($scope.rooms[i].gluco == null || $scope.rooms[i].gluco == '') && ($scope.rooms[i].astrid == null || $scope.rooms[i].astrid == '') ){
					var data = JSON.parse(JSON.stringify(roomService.roomsTemplate[0])) ;
					data.manager = 'roomManager';
					data.data[0].actionType = 'DEL';
					data.data[0].roomName = roomName;
					data.data[0].replyIds = ['ALL'];
					socket.emit('commManager', data);
					$scope.pop('success', 'SUCCESS', 'Room deleted');
					console.log('ROOM DELETED');
					return;
				}
				else {
					$scope.pop('warning', 'ERROR', 'You cannot delete a room that has a connected user');
					console.log('CANNOT DELETE AS USER CONNECTED');
					return;
				} 
			} 
		}
	}
	
	
	//CONNECT TO A ROOM
	
	$scope.roomConnect = function(roomName, clientType){
		var data = JSON.parse(JSON.stringify(roomService.roomsTemplate[0])) ;
		data.manager = 'roomManager';
		data.data[0].actionType = 'CON';
		data.data[0].roomName = roomName;
		data.data[0].clientType = clientType;
		data.data[0].replyIds = ['ALL'];
		socket.emit('commManager', data);
		$scope.pop('success', 'SUCCESS', 'You are connected to ' + roomName );
		return;
	}
	
	
	//DISCONNECT FROM A ROOM
	
	$scope.roomDis = function(){
		console.log('disconnect');
		var data = JSON.parse(JSON.stringify(roomService.roomsTemplate[0])) ;
		data.manager = 'roomManager';
		data.data[0].actionType = 'DIS';
		data.data[0].replyIds = ['ALL'];
		socket.emit('commManager', data);
		$scope.pop('success', 'SUCCESS', 'You are disconnected from the room');
		return;
	}
	
	$scope.pop = function(type, title, text){
	        toaster.pop(type, title, text);
	    };
}); 