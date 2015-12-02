app.filter('takenSpace', function () {
    return function (input) {
        input = input || '';
        var out = "";
        
        if(input == ''){
          out = "<span style='color:red'>Nothing here</span>";
        }
        else {
          out = "<span style='color:green'>" + input + "</span>";
        }
        
        
        return out;
    };
})


