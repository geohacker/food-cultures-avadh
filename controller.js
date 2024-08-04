const express = require('express');
const router = express.Router();
const xlsxFile = require('read-excel-file/node');
var XLSX = require('xlsx')
const { promisify } = require('util');
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./foodhistories-1ffb9c811b02.json');
const glossaryEnglish = require('./public/glossaryEnglish.json')
var fs = require('fs');
const translate = require('translate-google')
const { compile } = require('ejs');
const { redirect } = require('express/lib/response');
const { tl } = require('translate-google/languages');
const e = require('express');

router.get('/glossary', glossary);
router.get('/sheets/:id', readFile);
router.get('/', home)
router.get('/resources', resources);
router.get('/contact-us', contactUs)
router.get('/all', allRender);
router.get('/about-us', renderAboutUs);
module.exports = router;

const docid = {
    'resources-english': '1l2UfzOGY_6MloSinXmc5igWoFpgZmMH71sQj-gqhYXM',
    'sugarcane-hindi': '1nVB3EUOnGOr29zr05pHgMo__cfbK6g2ZZmPrdiHi5n4',
    'sugarcane-english': '1gY8EPFRs2EaPKiJ-Q39TwMvHyDfDXTS3',
    'pulses-english': '1o7H6tBKBErkeFXZ8Y-dqHDD73FbI6_R_',
    'land-english': '13ts0-7vFePbBIUdwghhKwZdCpPRSLGzx',
    'introduction-hindi': '1vu2feDijnecgnQ3pbpT1ziywCIuPgqonJRMEE5wgXVM',
    'introduction-english': '1lcUnmNKr7wyARTk6z2D0RxctYiI5hug6JyslgZq7LGM',
    'land-english': '13ts0-7vFePbBIUdwghhKwZdCpPRSLGzx',
    'hunger-hindi': '10XmgKuTYF7txji3bMRgPmu-FvgEJgcvsNVvP1T7tl9s',
    'hunger-english': '1RDW6iGo7jb8WeJCGzbkiOP8gtaVDVVEN',
    'groundnuts-english': '1yGSyifAu7LrTedLbh_jFp8AOKYWVE0u2',
    'fruits-hindi': '1x4vl1i7LIb0-5kZe_UA7z7GirLwamQZzJn9yids_Vng',
    'fruits-english': '1h-N3Rp1tqn2tDa9-hIEhgi5ZZXloptgb',
    'fish-hindi': '1Iz4iBnztuJToYHkYjDPilt20opqgGpB12t_OcBN5iNg',
    'fish-english': '1OG55eU2zDVM9tvHN0NPY0AtqQPSDSSbk',
    'dairy-hindi': '1i3djIeBHuHwpDAlOYHNO_JY59IBTIFnKLI88RoaLZM8',
    'dairy-english': '1QpA6yeaV0tuEGndA_DgW17SJzRNbacFy',
    'barley-hindi': '1X4ZOB3V7SET44gleD0Y_hJRQCzT4qNze',
    'barley-english': '1JvHJfSEgB5qTtwss2oOPCweIOQCyaUV1'
}

function renderAboutUs(req, res, next){
    res.render('aboutus', { 'cropName': "About-Us"})
}
function allRender(req, res, next){
    try {
        var workbook = XLSX.readFile(`./content/newcontent/english/All.xlsx`);
        var sheet_name_list = workbook.SheetNames;
        var rowsic = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var rowstl = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
    } catch (error) {
        console.log(error)
    }

    var myArray = [];

    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Season.split(',').map(function(item) {
            return item.trim();
        });
        for (j = 0; j < string.length; j++) {
            myArray.push(string[j]);
        }
    }
    var uniqueSeasons = myArray.filter((v, i, a) => a.indexOf(v) === i);
    

    myArray = [];
    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Caste.split(',').map(function(item) {
            return item.trim();
        });
        console.log("STRINGS ARE:")
        for (j = 0; j < string.length; j++) {
            console.log(string[j])
            myArray.push(string[j]);
        }
    }
    var uniqueCastes = myArray.filter((v, i, a) => a.indexOf(v) === i);

    myArray = [];
    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Geography.split(',').map(function(item) {
            return item.trim();
        });
        for (j = 0; j < string.length; j++) {
            myArray.push(string[j]);
        }
    }
    var cardType = [];
    var uniqueArr = [];
    for (i = 0; i < rowsic.length; i++)
        if (rowsic[i].Statement.toLowerCase().indexOf("youtube") > -1)
            cardType.push("Video");
        else if (rowsic[i].Statement.toLowerCase().indexOf("imagekit") > -1) {
        cardType.push("Image");
    } else
        cardType.push("Text");
    uniqueArr = cardType.filter((item, i, ar) => ar.indexOf(item) === i);
    var uniqueSoils = myArray.filter((v, i, a) => a.indexOf(v) === i);
    res.render("all", { 'dataic': rowsic, 'datatl': rowstl, 'cropName': 'All', 'soilfilter': uniqueSoils, 'seasonsfilter': uniqueSeasons, 'castefilter':uniqueCastes, 'typeFilter':uniqueArr, 'description': 'Coming Soon', 'image1': 'test', 'caption1':'test1', 'image2':'test2', 'caption2': 'test2' });
}
function glossary(req, res, next) {
    
    res.render("glossary", { 'cropName': "Glossary", 'glossaryEnglish': glossaryEnglish });
}

function resources(req, res, next) {
    try {
        var workbook = XLSX.readFile(`./content/Resources.xlsx`);
        var sheet_name_list = workbook.SheetNames;
        var primary = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var gazetteers = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
        var research = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);
        var reports = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[3]]);
    } catch (error) {
        console.log(error)
    }
    var pageTitlePrimary = "Primary Material";
    var pageDescriptionPrimary = "These papers, presentations etc. are outputs of this research and touch on various aspects of our findings"
    var pageTitleGazetteers = "Colonial reports";
    var pageDescriptionGazetteers = "Reports and documents produced by the British (and occasionally native) officials in colonial India. While they reflect the bias of the colonial powers, they also provide useful information about the region such as natural formations, crops and wildlife. They also describe developments such as the introduction of railways and the construction of the Sarda canal, a major source of irrigation in the region. A post-independence gazetteer and supplementary gazetteer can also be found here - they documents more recent developments such as the spread of tubewell irrigation and the 1979-80 drought."
    var pageTitleResearch = "Research papers";
    var pageDescriptionResearch = "These published papers touch on various aspects of the history of western Avadh, from archeological investigations to narratives of peasant revolts, as well as dietary transitions and wild or uncultivated foods."
    var pageTitleReports = "Reports & articles";
    var pageDescriptionReports = "These reports and articles cover topics of interest such as uncultivated foods, changes in land use etc."
    res.render("resources", { 'cropName': "Resources", 'resourcePrimary': primary, 'resourceGazetteers': gazetteers, 'resourceResearch': research, 'resourceReports': reports , 'pageTitlePrimary': pageTitlePrimary, 'pageDescriptionPrimary': pageDescriptionPrimary, 'pageTitleGazetteers':pageTitleGazetteers, 'pageDescriptionGazetteers': pageDescriptionGazetteers, 'pageTitleResearch':pageTitleResearch, 'pageDescriptionResearch':pageDescriptionResearch, 'pageTitleReports':pageTitleReports, 'pageDescriptionReports':pageDescriptionReports });




}

function convertToJSON(array) {
    var first = array[0].join()
    var headers = first.split(',');

    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++) {

        var myRow = array[i].join();
        var row = myRow.split(',');

        var data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);

    }
    return jsonData;
};

function readFile(req, res, next) {
    const id = req.params.id;
    id.replace(/\s(.)/g, function(a) {
            return a.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, function(b) {
            return b.toLowerCase();
        })
    const language = req.cookies.language;


    res.cookie("cropid", id, { maxAge: 900000, httpOnly: true })
    try {
        var workbook = XLSX.readFile(`./content/newcontent/english/${id}.xlsx`);
        var sheet_name_list = workbook.SheetNames;
        var rowstl = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
        var rowsic = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    } catch (error) {
        console.log(error)
        if (req.cookies.language == "hi")
            res.render('coming-soon-language', { "cropName": "Food histories" })
        else
            res.redirect("/");
    }
    try {
        var workbookHindi = XLSX.readFile(`./content/newcontent/hindi/${id}.xlsx`);
        var sheet_name_listHindi = workbookHindi.SheetNames;
        var rowstlHindi = XLSX.utils.sheet_to_json(workbookHindi.Sheets[sheet_name_listHindi[1]]);
        var rowsicHindi = XLSX.utils.sheet_to_json(workbookHindi.Sheets[sheet_name_listHindi[0]]);
    } catch (error) {
        console.log("ERROR READING HINDI CONTENT")
        var rowstlHindi = [];
        var rowsicHindi = [];
    }
    try {
        var workbook = XLSX.readFile(`./content/newcontent/english/Intro.xlsx`);
        var sheet_name_list = workbook.SheetNames;
        var descriptionEnglish = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
    } catch (error) {
        console.log(error)
    }
    try {
        var workbookHindi = XLSX.readFile(`./content/newcontent/hindi/Intro.xlsx`);
        var sheet_name_listHindi = workbookHindi.SheetNames;
        var descriptionHindi = XLSX.utils.sheet_to_json(workbookHindi.Sheets[sheet_name_listHindi[1]]);
    } catch (error) {
        console.log(error)
    }
    var myArray = [];

    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Season.split(',').map(function(item) {
            return item.trim();
        });
        for (j = 0; j < string.length; j++) {
            myArray.push(string[j]);
        }
    }
    var uniqueSeasons = myArray.filter((v, i, a) => a.indexOf(v) === i);
    

    myArray = [];
    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Caste.split(',').map(function(item) {
            return item.trim();
        });
        console.log("STRINGS ARE:")
        for (j = 0; j < string.length; j++) {
            console.log(string[j])
            myArray.push(string[j]);
        }
    }
    var uniqueCastes = myArray.filter((v, i, a) => a.indexOf(v) === i);

    myArray = [];
    for (var i = 0; i < rowsic.length; i++) {
        var string = rowsic[i].Geography.split(',').map(function(item) {
            return item.trim();
        });
        for (j = 0; j < string.length; j++) {
            myArray.push(string[j]);
        }
    }
    var uniqueSoils = myArray.filter((v, i, a) => a.indexOf(v) === i);


    //hindi-filters
    try {
        myArray = [];
        for (var i = 0; i < rowsicHindi.length; i++) {
            var string = rowsicHindi[i].Season.split(',').map(function(item) {
                return item.trim();
            });
            for (j = 0; j < string.length; j++) {
                myArray.push(string[j]);
            }
        }

        var uniqueSeasonsHindi = myArray.filter((v, i, a) => a.indexOf(v) === i);
        myArray = [];
        for (var i = 0; i < rowsicHindi.length; i++) {
            var string = rowsicHindi[i].Caste.split(',').map(function(item) {
                return item.trim();
            });
            for (j = 0; j < string.length; j++) {
                myArray.push(string[j]);
            }
        }
        var uniqueCastesHindi = myArray.filter((v, i, a) => a.indexOf(v) === i);
        myArray = [];
        for (var i = 0; i < rowsicHindi.length; i++) {
            var string = rowsicHindi[i].Soil.split(',').map(function(item) {
                return item.trim();
            });
            for (j = 0; j < string.length; j++) {
                myArray.push(string[j]);
            }
        }
        var uniqueSoilsHindi = myArray.filter((v, i, a) => a.indexOf(v) === i);
    } catch (error) {
        console.log(error)
        var uniqueSeasonsHindi = [];
        var uniqueCastesHindi = [];
        var uniqueSoilsHindi = []
    }
    var cardType = [];
    var uniqueArr = [];
    for (i = 0; i < rowsic.length; i++)
        if (rowsic[i].Statement.toLowerCase().indexOf("youtube") > -1)
            cardType.push("Video");
        else if (rowsic[i].Statement.toLowerCase().indexOf("imagekit") > -1) {
        cardType.push("Image");
    } else
        cardType.push("Text");
    uniqueArr = cardType.filter((item, i, ar) => ar.indexOf(item) === i);
    cardTypeHindi = [];
    uniqueArrHindi = [];
    for (i = 0; i < rowsicHindi.length; i++)
        if (rowsicHindi[i].Statement.toLowerCase().indexOf("youtube") > -1)
            cardTypeHindi.push("Video");
        else if (rowsicHindi[i].Statement.toLowerCase().indexOf("imagekit") > -1)
        cardTypeHindi.push("Image");
    else
        cardTypeHindi.push("Text");
    uniqueArrHindi = cardTypeHindi.filter((item, i, ar) => ar.indexOf(item) === i);
    try {
        for (i = 0; i < descriptionEnglish.length; i++) {
            if (descriptionEnglish[i].cropEnglish.toLowerCase().indexOf(id.toLowerCase()) > -1)
                var descriptionEnglishI = descriptionEnglish[i]
        }
    } catch (error) {
        console.log(error)
        var description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis elit justo, sit amet tristique justo porttitor sit amet. In condimentum eros vel egestas tempor. Etiam tincidunt diam urna, idconsectetur erat tincidunt at. Aenean vitaeorci quam. Aliquam id risus nunc. Nunc efficitur pretium sapien. Phasellus lobortis a lorem eget blandit."
    }
    try {
        for (i = 0; i < descriptionHindi.length; i++) {
            if (descriptionHindi[i].cropEnglish.toLowerCase().indexOf(id.toLowerCase()) > -1)
                var descriptionHindiI = descriptionHindi[i]
        }
    } catch (error) {
        console.log(error)
        var description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis elit justo, sit amet tristique justo porttitor sit amet. In condimentum eros vel egestas tempor. Etiam tincidunt diam urna, idconsectetur erat tincidunt at. Aenean vitaeorci quam. Aliquam id risus nunc. Nunc efficitur pretium sapien. Phasellus lobortis a lorem eget blandit."
    }
    uniqueSeasons=uniqueSeasons.sort();
    uniqueCastes=uniqueCastes.sort();
    uniqueSoils=uniqueSoils.sort();
    res.render('barley', { "crop": id, "datatl": rowstl, "dataic": rowsic, "datatlHindi": rowstlHindi, "dataicHindi": rowsicHindi, 'seasonsfilter': uniqueSeasons, 'castefilter': uniqueCastes, 'soilfilter': uniqueSoils, 'typeFilter': uniqueArr, 'typeFilterHindi': uniqueArrHindi, 'seasonsfilterHindi': uniqueSeasonsHindi, 'castefilterHindi': uniqueCastesHindi, 'soilfilterHindi': uniqueSoilsHindi, 'cropName': descriptionEnglishI.food, 'description': descriptionEnglishI.Text, 'image1': descriptionEnglishI.Image1, 'image2': descriptionEnglishI.Image2, 'caption1': descriptionEnglishI.Caption1, 'caption2': descriptionEnglishI.Caption2, 'cropNameHindi': descriptionHindiI.crop, 'descriptionHindi': descriptionHindiI.Text, 'image1Hindi': descriptionHindiI.Image1, 'image2Hindi': descriptionHindiI.Image2, 'caption1Hindi': descriptionHindiI.Caption1, 'caption2Hindi': descriptionHindiI.Caption2 });



}

function admin(req, res, next) {
    res.render("admin");
}

function contactUs(req, res, next) {
    res.render('contact-us', { "cropName": "Contact Us" })
}

function home(req, res, next) {
    try {
        var workbooktl = XLSX.readFile(`./content/newcontent/english/Intro.xlsx`);
        var sheet_name_listtl = workbooktl.SheetNames;
        var introEnglish = XLSX.utils.sheet_to_json(workbooktl.Sheets[sheet_name_listtl[0]]);
    } catch (error) {
        console.log(error)
        if (req.cookies.language == "hi")
            res.render('coming-soon-language', { "cropName": "Food histories" })
        else
            res.redirect("/");
    }
    try {
        var workbooktlHindi = XLSX.readFile(`./content/newcontent/hindi/Intro.xlsx`);
        var sheet_name_listtlHindi = workbooktlHindi.SheetNames;
        var introHindi = XLSX.utils.sheet_to_json(workbooktlHindi.Sheets[sheet_name_listtlHindi[0]]);
    } catch (error) {
        console.log(error)
        var rowstlHindi = [];
        var rowsicHindi = [];
    }
    
    res.render('home', { 'cropName': "Home", 'homeTitle': introEnglish[0].Title, 'homeText1': introEnglish[0].Text, 'homeTitleHindi': introHindi[0].Title, 'homeTextHindi1': introHindi[0].Text });
}