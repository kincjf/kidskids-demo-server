var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const { json } = require('body-parser');

//var moment = require('moment');

// Configuration
mongoose.connect('mongodb://127.0.0.1:27017/test');

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

var imageRoot = '../../assets/image/';


var main_category = ["아우터", "상의", "하의", "스커트", "원피스", "세트", "슈즈", "신생아", "가방"];
var sub_category1 = ["티셔츠", "맨투맨", "후드/후디", "셔츠/남방", "니트/니트웨어/스웨터", "블라우스", "민소매/나시", "커플 상의"];
var sub_category2 = ["일자바지", "반바지/숏팬츠", "멜빵바지", "레깅스", "청바지"];
var sub_category3 = ["롱스커트", "미니스커트", "미디스커트"];
var sub_category4 = ["미니원피스", "롱원피스", "투피스/세트", "시밀러룩/패밀리룩", "드레스"];
var sub_category0 = ["코트", "패딩", "자켓", "가디건", "야상", "베스트", "커플 아우터"];
var subCategotyMap = [sub_category0, sub_category1, sub_category2, sub_category3, sub_category4, sub_category0, sub_category0, sub_category0, sub_category0];
var store = ["bebenew_st", "bobbymall_st", "bori_st", "franchi_st", "mo_st", "ozkiz_st", "rittle_st", "stylenoriter_st", "thehanbok_st", "toebox_st", "zts_st"];
var color = ["검정", "빨강", "노랑", "남색"];
var style = ["예쁜", "러블리", "오피스", "힙"];
var material = ["면", "합성섬유", "오리털", "린넨"];

var recordsToGenerate = 200;

var Store = mongoose.model('Store', {
    ID: Number,
    name: String,
    subScript: String,
    url: String,
    imageUrl: String,

    likeOption: {
        like_count: Number,
        like_date: String
    },
    update_date: String,
    tag: []
});

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

var UserInfo = mongoose.model('UserInfo', {
    userID: { type: String, unique: true },
    displayName: String,
    children: [
        {
            id: Number,
            name: String,
            gender: String,
            birthday: String,
            icon_img: String
        }
    ],
    liked_items: [
        {
            itemID: String,
            title: String,
            price: Number,
            linkUrl: String,
            img: String,
            review_rating: String,
            create_date: String
        }
    ],
    checked_list: [
        
    ],
    my_checkList : [

    ]
})



var Categoty = mongoose.model('Category', {
    ID: Number,
    name: String,
    parent: Number,
    image: String,
    children: [String],
    like_count: Number
});

var Child = mongoose.model('child', {
    parentID: String,
    name: String,
    gender: String,
    birthday: String
});

var Liked_item = mongoose.model('Liked_item', {
    itemID: String,
    title: String,
    price: Number,
    linkUrl: String,
    img: String,
    review_rating: String,
    create_date: String
})

var resultForm = {
    color: [],
    style: [],
    material: []
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//회원가입 대비 유저 이메일 변경
app.post('/api/userInfo/updateEmail', async function(req,res){
    try {
        var post = await UserInfo.findOne({ userID: req.body.deviceID });
        if (!post) return res.status(404).json({ message: "post not found" });

        post.userID = req.body.userID;

        var output = await post.save();
        console.log("delete success")
        res.status(200).json(output);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//유저의 찜 상품 정보 삭제
app.post('/api/userInfo/deleteLiked', async function (req, res) {
    console.log(req.body)

    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        for (var i = 0; i < post.liked_items.length; i++) {
            if (post.liked_items[i].itemID == req.body.query.itemID) {
                post.liked_items.splice(i, 1);
                break;
            }
        }

        var output = await post.save();
        console.log("delete success")
        res.status(200).json(output.liked_items);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//유저의 찜 상품정보 추가하기
app.post('/api/userInfo/insertLiked', async function (req, res) {
    console.log(req.body)

    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        post.liked_items.push({
            itemID: req.body.data.itemID,
            title: req.body.data.title,
            price: req.body.data.price,
            linkUrl: req.body.data.linkUrl,
            img: req.body.data.img,
            review_rating: req.body.data.review_rating,
            create_date: req.body.data.create_date
        })

        var output = await post.save();
        console.log("update success")
        res.status(200).json(output.liked_items);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})



//유저의 정보 GET
app.post('/api/userInfo/getUserinfo', function (req, res) {
    UserInfo.findOne({ userID: req.body.userID }).then(post => {
        res.status(200).json(post);
    }).catch(err => {
        res.status(500).json(err);
    })
})

//유저의 아이정보 삭제
app.post('/api/userInfo/deleteChildren', async function (req, res) {
    console.log(req.body)
    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        var tempArr = [];
        for (var i = 0; i < post.children.length; i++) {
            if (i < req.body.query.childID) tempArr.push(post.children[i])
            else if (i == req.body.query.childID) { continue; }
            else {
                post.children[i].id = post.children[i].id - 1;
                tempArr.push(post.children[i])
            }
        }

        post.children = tempArr;
        var output = await post.save();
        console.log("update success")
        res.status(200).json(output.children);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//유저가 체크한 리스트 GET
app.post('/api/userInfo/getCheckedList', function (req, res) {
    UserInfo.findOne({ userID: req.body.userID }).then(post => {
        res.status(200).json(post.checked_list);
    }).catch(err => {
        res.status(500).json(err);
    })
})

//유저가 체크한 리스트 추가하기
app.post('/api/userInfo/insertChecked', async function (req, res) {
    console.log(req.body)

    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        post.checked_list.push(req.body.data.checkedID);

        var output = await post.save();
        console.log("update success")
        res.status(200).json(output.checked_list);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//유저가 체크한 리스트 삭제
app.post('/api/userInfo/deleteCheckedList', async function (req, res) {
    console.log(req.body)

    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        for (var i = 0; i < post.checked_list.length; i++) {
            if (post.checked_list[i].itemID == req.body.query.itemID) {
                post.checked_list.splice(i, 1);
                break;
            }
        }

        var output = await post.save();
        console.log("delete success")
        res.status(200).json(output.checked_list);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//신규 유저 정보 생성
app.post('/api/userInfo/insert', function (req, res) {
    console.log(req.body)

    var newUser = UserInfo({
        userID: req.body.userID,
        children: [],
        liked_items:[],
        checked_list:[],
        my_checkList: []

    })

    newUser.save().then(data => {
        res.status(200).json(data)
    }).catch(err => {
        res.status(500).json({
            message: err
        })
    })
})


//유저정보 삭제
app.post('/api/userInfo/delete', function (req, res) {
    UserInfo.deleteOne({userID:req.body.query.parentID}).then(_=>{
        res.status(200).json({message : "user delete success"})
    }).catch(err=>{        
        res.status(500).json({message: err});
    })

})


//유저의 아이정보 추가하기
app.post('/api/userInfo/insertChildren', async function (req, res) {
    console.log(req.body)

    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        req.body.data.children.forEach(element => {
            post.children.push({
                id: post.children.length,
                name: element.name,
                gender: element.gender,
                birthday: element.birthday,
                icon_img: element.icon_img
            })
            console.log(element.icon_img)
        });

        var output = await post.save();
        console.log("update success")
        res.status(200).json(output.children);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

//유저의 아이 정보 Update
app.post('/api/userInfo/updateChildren', async function (req, res) {
    try {
        var post = await UserInfo.findOne({ userID: req.body.query.parentID });
        if (!post) return res.status(404).json({ message: "post not found" });

        post.children.forEach(element => {
            if (element.id == req.body.query.childID) {
                element.name = req.body.data.name;
                element.gender = req.body.data.gender;
                element.birthday = req.body.data.birthday;
                element.icon_img = req.body.data.icon_img
            }
        });

        var output = await post.save();
        console.log("update success")
        res.status(200).json(output.children);
    } catch (err) {
        res.status(500).json({
            message: err
        })
    }
})

UserInfo.count({}, function (err, count) {
    console.log("UserInfo count =    " + count)
})

Liked_item.count({}, function (err, count) {
    console.log("liked item =     " + count)
})


// Item.remove({}, function (res) {
//      console.log("removed records");
// });

// Categoty.remove({}, function (res) {
//     console.log("removed categories");
// });
// Store.remove({}, function(res){
//     console.log('removed Stores');
// });

// Store.count({}, function (err, count) {
//     console.log("Store: " + count);

//     if (count === 0) {
//         console.log("Creat stores");
//         for (var i = 0; i < store.length; i++) {
//             var newStore = new Store({
//                 ID: i + 1,
//                 name: store[i],
//                 subScript: "이것은 "+ store[i]+ "의 설명이다.",
//                 url: "http://www.naver.com",
//                 imageUrl: imageRoot+store[i]+".svg",
//                 like_count: 0,
//                 likeOption: {
//                     like_date: '2018-' + getRandomInt(1, 12) + '-' + getRandomInt(1, 30),
//                     like_age: Number,
//                 },
//                 update_date: '2019-' + getRandomInt(1, 12) + '-' + getRandomInt(1, 30),
//                 tag: []
//             });
//             newStore.save(function(err, doc){});
//         }

//     }
// })

// Item.count({}, function (err, count) {
//     console.log("Item: " + count);

//     if (count === 0) {
//         console.log("Create test items");
//         for (var i = 0; i < recordsToGenerate; i++) {

//             var randomColor = [];
//             var randomStyle = [];
//             var randomMaterial = [];

//             var mainCategorySelect
//             var subCategotySelect = "";
//             var random = Math.floor(Math.random() * 5) + 1;
//             switch (random) {
//                 case 1:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category0.length));
//                     break;
//                 case 2:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category1.length));
//                     break;
//                 case 3:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category2.length));
//                     break;
//                 case 4:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category3.length));
//                     break;
//                 case 5:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category4.length));
//                     break;
//                 default:
//                     mainCategorySelect = random;
//                     subCategotySelect = String(random) + String(Math.floor(Math.random() * sub_category0.length));
//             }

//             for (var a = 0; a < 4; a++) {
//                 if (getRandomInt(0, 1) == 1) {
//                     randomColor.push(color[a]);
//                     a = 4;
//                 }
//             }
//             if (randomColor.length == 0) randomColor.push("Undefind");
//             for (var a = 0; a < 4; a++) {

//                 if (getRandomInt(0, 1) == 1) {
//                     randomStyle.push(style[a]);
//                     a = 4;
//                 }
//             }
//             if (randomStyle.length == 0) randomStyle.push("Undefind");

//             for (var a = 0; a < 4; a++) {

//                 if (getRandomInt(0, 1) == 1) {
//                     randomMaterial.push(material[a]);
//                     a = 4;
//                 }
//             }
//             if (randomMaterial.length == 0) randomMaterial.push("Undefind");

//             var newItem = new Item({
//                 ID: i + 1,
//                 name: 'testIem' + i,
//                 size: [0, getRandomInt(1, 10)],
//                 create_date: '',
//                 imageUrl: imageRoot + "testImage" + getRandomInt(0, 4) + ".png",
//                 shopUrl: 'http://www.google.com',
//                 itemUrl: 'http://www.naver.com',
//                 price: getRandomInt(1, 20) * 1000,

//                 color: randomColor,
//                 style: randomStyle,
//                 material: randomMaterial,
//                 tag: [],

//                 main_category: mainCategorySelect,
//                 sub_category: subCategotySelect,
//                 related_item: [],
//                 likeCount: getRandomInt(0, 100),
//                 likeOptions: {
//                     like_date: '2018-' + getRandomInt(1, 12) + '-' + getRandomInt(1, 30),
//                     like_age: getRandomInt(1, 12),
//                 },
//                 ad_state: false
//             });

//             newItem.save(function (err, doc) {

//             });
//         }
//     }
// });

// Categoty.count({}, function (err, count) {
//     console.log("Category: " + count);

//     if (count === 0) {
//         console.log("Create test categories");
//         for (var i = 0; i < main_category.length; i++) {

//             var subcategory = e9subCategotyMap[i];

//             var subcategoryList = [];

//             for (var j = 0; j < subcategory.length; j++) {
//                 subcategoryList.push(String(i + 1) + String(j + 1));
//             }


//             var newCategoty = new Categoty({
//                 ID: i + 1,
//                 name: main_category[i],
//                 parent: 0,
//                 image: imageRoot+"testCaImage"+i+".svg",
//                 children: subcategoryList,
//                 like_count: 0
//             });

//             newCategoty.save(function (err, doc) {

//             });

//             for (var j = 0; j < subcategoryList.length; j++) {
//                 var subCategotyNameList;

//                 switch (j) {
//                     case 0:
//                         subCategotyNameList = sub_category0;
//                         break;
//                     case 1:
//                         subCategotyNameList = sub_category1;
//                         break;
//                     case 2:
//                         subCategotyNameList = sub_category2;
//                         break;
//                     case 3:
//                         subCategotyNameList = sub_category3;
//                         break;
//                     case 4:
//                         subCategotyNameList = sub_category4;
//                         break;
//                     default:
//                         subCategotyNameList = sub_category0;
//                 }

//                 var newSubCategoty = new Categoty({
//                     ID: subcategoryList[j],
//                     name: subCategotyNameList[j],
//                     parent: i + 1,
//                     image: imageRoot + "testImage0.png",
//                     children: null,
//                     like_count: 0
//                 });

//                 newSubCategoty.save(function (err, doc) {

//                 });
//             }
//         }
//     }

// });
//GET 전체 카테고리 
app.get('/api/categories', function (req, res) {
    Categoty.find(function (err, categories) {
        if (err) return res.status(500).send({ error: 'load categories failure' });
        res.json(categories);
    });
});

//get 전체 스토어 리스트

app.get('/api/stores', function (req, res) {
    Store.find(function (err, stores) {
        if (err) return res.status(500).send({ error: 'load stores failure' });
        res.json(stores);
    });
});

//get store id 검색
app.get('/api/stores/:id', function (req, res) {
    Store.findOne({ ID: req.params.id }, function (err, stores) {
        if (err) return res.status(500).send({ error: 'load store by Id failure' });
        res.json(stores);
    });
})

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
// app.post('/api/items/filter', function (req, res) {
//     console.log(req);
//     Item.find({
//         $or: [{ main_category: req.body.category }, { sub_category: req.body.category }],
//         price: { $gte: req.body.min_Price, $lte: req.body.max_Price },

//         color: { $elemMatch: { $in: req.body.attributes.color } },
//         style: { $elemMatch: { $in: req.body.attributes.style } },
//         material: { $elemMatch: { $in: req.body.attributes.material } }

//     }, function (err, items) {
//         if (err) return res.status(500).send({ error: 'load items failure' });
//         res.json(items);

//     });
// });

// 해당 카테고리의 옵션값 검색
app.get('/api/category/attributes/:id', function (req, res) {
    var categoryItems = [];
    Item.find(function (err, items) {
        if (parseInt(req.params.id) >= 10) {
            Item.find({ sub_category: req.params.id }, function (err, items) {
                if (err) return res.status(500).send({ error: 'items search failure' });
                res.json(searchAttributes(items));
            });
        }
        else {
            Item.find({ main_category: req.params.id }, function (err, items) {
                if (err) return res.status(500).send({ error: 'items search failure' });
                res.json(searchAttributes(items));
            });
        }

    })
});

//아이템 리스트에서 옵션값만 추출
function searchAttributes(items) {
    var result = resultForm;
    var tempColorArray = [];
    var tempStyleArray = [];
    var tempMaterialArray = [];

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        for (var j = 0; j < item.color.length; j++) {
            tempColorArray.push(item.color[j]);
        }
        tempColorArray = Array.from(new Set(tempColorArray));
        result.color = tempColorArray;

        for (var j = 0; j < item.style.length; j++) {
            tempStyleArray.push(item.style[j]);
        }
        tempStyleArray = Array.from(new Set(tempStyleArray));
        result.style = tempStyleArray;

        for (var j = 0; j < item.material.length; j++) {
            tempMaterialArray.push(item.material[j]);
        }
        tempMaterialArray = Array.from(new Set(tempMaterialArray));
        result.material = tempMaterialArray;

    }

    return result;
}





app.listen(8080);
