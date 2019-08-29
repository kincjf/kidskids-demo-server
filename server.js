var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

//var moment = require('moment');

// Configuration
mongoose.connect('mongodb://127.0.0.1:27017/test');

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

var imageRoot = '../../assets/image/';


var main_category = ["아우터", "상의", "하의", "스커트", "원피스/세트", "커플 아우터"];
var sub_category1 = ["티셔츠", "맨투맨", "후드/후디", "셔츠/남방", "니트/니트웨어/스웨터", "블라우스", "민소매/나시", "커플 상의"];
var sub_category2 = ["일자바지", "반바지/숏팬츠", "멜빵바지", "레깅스", "청바지"];
var sub_category3 = ["롱스커트", "미니스커트", "미디스커트"];
var sub_category4 = ["미니원피스", "롱원피스", "투피스/세트", "시밀러룩/패밀리룩", "드레스"];
var sub_category0 = ["코트", "패딩", "자켓", "가디건", "야상", "베스트", "커플 아우터"];
var subCategotyMap = [sub_category0, sub_category1, sub_category2, sub_category3, sub_category4];

var color = ["검정", "빨강", "노랑", "남색"];
var style = ["예쁜", "러블리", "오피스", "힙"];
var material = ["면", "합성섬유", "오리털", "린넨"];

var recordsToGenerate = 200;

var Item = mongoose.model('Item', {
    ID: Number,
    name: String,
    size: [],
    create_date: String,
    imageUrl: String,
    shopUrl: String,
    itemUrl: String,
    price: Number,

    color: [String],
    style: [String],
    material: [String],
    tag: [],

    main_category: Number,
    sub_category: Number,
    related_item: [String],
    likeCount: Number,
    likeOptions: {
        like_date: String,
        like_age: String,
    },
    ad_state: Boolean
});



var Categoty = mongoose.model('Category', {
    ID: Number,
    name: String,
    parent: Number,
    image: String,
    children: [String],
    like_count: Number
});

var resultForm = {
    max_Price: Number,
    min_Price: Number,
    color: [],
    style: [],
    material: [],
    items: [],
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Item.remove({}, function (res) {
//      console.log("removed records");
// });

// Categoty.remove({}, function (res) {
//     console.log("removed categories");
// });


Item.count({}, function (err, count) {
    console.log("Item: " + count);

    if (count === 0) {
        console.log("Create test items");
        for (var i = 0; i < recordsToGenerate; i++) {

            var randomColor = [];
            var randomStyle = [];
            var randomMaterial = [];

            var mainCategorySelect
            var subCategotySelect = "";
            var random = Math.floor(Math.random() * 5) + 1;
            switch (random) {
                case 1:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category0.length));
                    break;
                case 2:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category1.length));
                    break;
                case 3:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category2.length));
                    break;
                case 4:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category3.length));
                    break;
                case 5:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category4.length));
                    break;
                default:
                    mainCategorySelect = random;
                    subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category0.length));
            }

            for (var a = 0; a < 4; a++) {

                if (getRandomInt(0, 1) == 1) {
                    randomColor.push(color[a]);
                }
                if (randomColor.length == 0) randomColor.push("Undefind");
            }
            for (var a = 0; a < 4; a++) {

                if (getRandomInt(0, 1) == 1) {
                    randomStyle.push(style[a]);
                }
                if (randomStyle.length == 0) randomStyle.push("Undefind");
            }

            for (var a = 0; a < 4; a++) {

                if (getRandomInt(0, 1) == 1) {
                    randomMaterial.push(material[a]);
                }
                if (randomMaterial.length == 0) randomMaterial.push("Undefind");
            }

            var newItem = new Item({
                ID: i + 1,
                name: 'testIem' + i,
                size: [0, getRandomInt(1, 10)],
                create_date: '',
                imageUrl: imageRoot + "testImage" + getRandomInt(0, 4) + ".png",
                shopUrl: 'http://www.google.com',
                itemUrl: 'http://www.naver.com',
                price: getRandomInt(1, 20) * 1000,

                color: randomColor,
                style: randomStyle,
                material: randomMaterial,
                tag: [],

                main_category: mainCategorySelect,
                sub_category: subCategotySelect,
                related_item: [],
                likeCount: getRandomInt(0, 100),
                likeOptions: {
                    like_date: '2018-' + getRandomInt(1, 12) + '-' + getRandomInt(1, 30),
                    like_age: getRandomInt(1, 12),
                },
                ad_state: false
            });

            newItem.save(function (err, doc) {

            });
        }
    }
});

Categoty.count({}, function (err, count) {
    console.log("Category: " + count);

    if (count === 0) {
        console.log("Create test categories");
        for (var i = 0; i < 5; i++) {
            var subcategory = subCategotyMap[i];

            var subcategoryList = [];

            for (var j = 0; j < subcategory.length; j++) {
                subcategoryList.push(String(i + 1) + String(j + 1));
            }


            var newCategoty = new Categoty({
                ID: i + 1,
                name: main_category[i],
                parent: 0,
                image: "",
                children: subcategoryList,
                like_count: 0
            });

            newCategoty.save(function (err, doc) {

            });

            for (var j = 0; j < subcategoryList.length; j++) {
                var subCategotyNameList;

                switch (j) {
                    case 0:
                        subCategotyNameList = sub_category0;
                        break;
                    case 1:
                        subCategotyNameList = sub_category1;
                        break;
                    case 2:
                        subCategotyNameList = sub_category2;
                        break;
                    case 3:
                        subCategotyNameList = sub_category3;
                        break;
                    case 4:
                        subCategotyNameList = sub_category4;
                        break;
                    default:
                        subCategotyNameList = sub_category0;
                }

                var newSubCategoty = new Categoty({
                    ID: subcategoryList[j],
                    name: subCategotyNameList[j],
                    parent: i + 1,
                    image: imageRoot + "testImage0.png",
                    children: null,
                    like_count: 0
                });

                newSubCategoty.save(function (err, doc) {

                });
            }
        }
    }

});
//GET 전체 카테고리 
app.get('/api/categories', function (req, res) {
    Categoty.find(function (err, categories) {
        if (err) return res.status(500).send({ error: 'load categories failure' });
        res.json(categories);
    });
});

//특정 카테고리 아이템 검색
app.get('/api/categories/items/:id', function (req, res) {
    if (parseInt(req.params.id) >= 10) {
        Item.find({ sub_category: req.params.id }, function (err, items) {
            if (err) return res.status(500).send({ error: 'items search failure' });
            res.json(items);
        });
    }
    else {
        Item.find({ main_category: req.params.id }, function (err, items) {
            if (err) return res.status(500).send({ error: 'items search failure' });
            res.json(items);
        });
    }
});

// 필터 적용된 아이템 검색
app.post('/api/items/filter', function (req, res) {
    Item.find({
        $or: [{ main_category: req.body.category }, { sub_category: req.body.category }],
        price: { $gte: req.body.min_Price, $lte: req.body.max_Price },

        color: { $elemMatch: { $in: req.body.color } },
        style: { $elemMatch: { $in: req.body.style } },
        material: { $elemMatch: { $in: req.body.material } }

    }, function (err, items) {
        if (err) return res.status(500).send({ error: 'load items failure' });
        var result = resultForm;
        result.items = items;
        
        items.forEach(function (item, index, array) {
            item.color.forEach(function (color, index, array) {
                result.color.push(color);
            });
            item.style.forEach(function (style) {
                result.style.push(style);
            });
            item.material.forEach(function (material) {
                result.material.push(material);
            });
            result.color = Array.from(new Set(result.color));
            result.material = Array.from(new Set(result.material));
            result.style = Array.from(new Set(result.style));
        });

        
        res.json(items);

    });    
});

//GET 전체 아이템
app.get('/api/items', function (req, res) {


    Item.find(function (err, items) {
        if (err) return res.status(500).send({ error: 'load items failure' });
        res.json(items)
    });
});

app.listen(8080);
