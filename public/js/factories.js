app.factory('socket', function(){
    return io.connect('http://localhost:3000');
});


app.factory("roomService", function () {
    return {
        rooms: [],
        roomsTemplate: [
            {
                manager: '',
                data: [
                    {
                        actionType: '',
                        replyIds: [],
                        roomName: '',
                        roomType: '', 
                        clientType : ''
                    }
                ]
            }
        ],
        roomTypes: [
            { id: 0, clients: 1, name: 'Saturomètre', clientIndex: { 0: 'Saturomètre' } },
            { id: 1, clients: 1, name: 'Glucomètre', clientIndex: { 0: 'Glucomètre'} },
            { id: 2, clients: 1, name: 'Astrid', clientIndex: { 0: 'Astrid' } },
            { id: 3, clients: 2, name: 'Saturomètre & Glucomètre', clientIndex: { 0: 'Saturomètre', 1: 'Glucomètre' } },
            { id: 4, clients: 2, name: 'Saturomètre & Astrid', clientIndex: { 0: 'Saturomètre', 1: 'Astrid' } },
            { id: 5, clients: 2, name: 'Glucomètre & Astrid', clientIndex: { 0: 'Glucomètre', 1: 'Astrid' } },
            { id: 6, clients: 3, name: 'Saturomètre & Glucomètre & Astrid', clientIndex: { 0: 'Saturomètre', 1: 'Glucomètre', 2: 'Astrid' } }
        ]
    };
});

app.factory("clientService", function () {
    return {
        clientTypes: [
            {
                '0': 'Saturomètre',
                '1': 'Glucomètre',
                '2': 'Astrid'
            }
        ]
    };
});


app.factory("userService", function(){
    return {
        selfId : "", 
        connected : false
    };
});