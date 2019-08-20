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
var Item = mongoose.model('Item', {
    ID: Number,
    name: String,
    size: {
        min: Number,
        max: Number
    },
    create_date: String,
    imageUrl: String,
    shopUrl: String,
    itemUrl: String,
    atribute: {
        price: Number,
        color: [String],
        style: [String],
        material: [String],
        tag: []
    },
    main_categoty: String,
    sub_category: String,
    related_item: [String],
    likeCount: Number,
    likeOptions: {
        like_date: String,
        like_age: String,
    },
    ad_state: Boolean
});

var categoty = mongoose.model('Category', {

});
 
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
Item.remove({}, function (res) {
    console.log("removed records");
});

Item.count({}, function (err, count) {
    console.log("Item: " + count);

    
    if (count === 0) {
        var recordsToGenerate = 200;

        var main_category = ["아우터", "상의", "하의", "스커트", "원피스/세트", "커플 아우터"];
        var sub_category1 = ["티셔츠", "맨투맨", "후드/후디", "셔츠/남방", "니트/니트웨어/스웨터", "블라우스", "민소매/나시", "커플 상의"];
        var sub_category2 = ["일자바지", "반바지/숏팬츠", "멜빵바지", "레깅스", "청바지"];
        var sub_category3 = ["롱스커트", "미니스커트", "미디스커트"];
        var sub_category4 = ["미니원피스", "롱원피스", "투피스/세트", "시밀러룩/패밀리룩", "드레스"];
        var sub_category0 = ["코트", "패딩", "자켓", "가디건", "야상", "베스트", "커플 아우터"];
        var color = ["검정", "빨강", "노랑", "남색"];

        for (var i = 0; i < recordsToGenerate; i++) {

            var mainCategorySelect
            var subCategotySelect = "";
            switch (Math.floor(Math.random() * 5)) {
                case 0:
                    mainCategorySelect = main_category[0];
                    subCategotySelect = sub_category0[Math.floor(Math.random() * sub_category0.length)];
                    break;
                case 1:
                    mainCategorySelect = main_category[1];
                    subCategotySelect = sub_category1[Math.floor(Math.random() * sub_category1.length)];
                    break;
                case 2:
                    mainCategorySelect = main_category[2];
                    subCategotySelect = sub_category2[Math.floor(Math.random() * sub_category2.length)];
                    break;
                case 3:
                    mainCategorySelect = main_category[3];
                    subCategotySelect = sub_category3[Math.floor(Math.random() * sub_category3.length)];
                    break;
                case 4:
                    mainCategorySelect = main_category[4];
                    subCategotySelect = sub_category4[Math.floor(Math.random() * sub_category4.length)];
                    break;
                default:
                    mainCategorySelect = main_category[0];
                    subCategotySelect = sub_category0[Math.floor(Math.random() * sub_category0.length)];
            }

            var newItem = new Item({
                ID: i,
                name: 'testIem' + i,
                size: {
                    max: 0,
                    min: getRandomInt(1, 10),
                },
                create_date: '',
                imageUrl: imageRoot + "testImage" + getRandomInt(0, 4) + ".png",
                shopUrl: 'http://www.google.com',
                itemUrl: 'http://www.naver.com',
                atribute: {
                    price: getRandomInt(1, 20) * 1000,
                    color: color,
                    style: [],
                    material: [],
                    tag: []
                },
                main_categoty: mainCategorySelect,
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
                console.log("Create test document: " + doc.ID)
            });
        }
    }
});

app.get('/api/items', function(req,res) {
    Item.find(function(err, items){
        if(err) return res.status(500).send({error : 'database failure'});
        res.json(items);
    });
});

app.listen(8080);
