const config = require('config.json');
const XLSC = require('xlsx')


module.exports = {
    
};

function readFile(){
    var workbook = XLSX.readFile('test.xlsx');
    console.log(workbook);
}

