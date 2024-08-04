var excel2json = require('excel2json')
const testFolder = './tests/';
const fs = require('fs');

var filename = [];
var sheets = [3];

fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
        filename.append(file);
    });
});

console.log(filename);
/*excel2json.parse(filename, sheets, function (err, data) {
    console.log(data);

    excel2json.toJson(data, function (err, json) {
        console.log(json);
    });
});*/