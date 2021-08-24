//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-soham:soham@cluster0.rgrzw.mongodb.net/todolist-v2DB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

const itemsSchema = mongoose.Schema({
  item: {
    type: String,
    required: true
  }
});

const listSchema = mongoose.Schema({
  name: String, items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  item: 'Welcome to your todolist'
})

const item2 = new Item({
  item: 'Hit the + button to add a new item'
})

const item3 = new Item({
  item: '←  Hit this to delete an item'
})

const defaultItems = [item1, item2, item3]


// Item.insertMany(items, function(err) {
//   if (err) console.log(err)
//   else console.log('insert successful')
// })



const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log('success')
        res.redirect('/')
      })
      
    } else {
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){

  const listName = req.body.list;

  const item = new Item({
    item: String(req.body.newItem)
  });

  if (listName == 'Today'){
    item.save();
    res.redirect('/')
  } else {
    List.findOne({name: listName}, function(err, list){
      list.items.push(item)
      list.save()
      res.redirect('/' + lodash.lowerCase(listName));
    })
  }

});

app.post('/delete', (req, res) => {
  const id = req.body.delete;
  const listName = req.body.listName;

  if (listName == 'Today') {
    Item.findByIdAndRemove(id, function(err){
      if (err) console.log(err);
      else {
        console.log('No errors, successfuly deleted selected items')
        res.redirect('/');
      }
    })
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: id}}},
      function(err, list){
        if (!err) {
          res.redirect('/' + lodash.lowerCase(listName));
        }
      }
    )
  }

  


})


app.get('/:name', function(req, res){

  List.findOne({name: lodash.capitalize(req.params.name)}, function(err, list){
    if (!err) {
      if (!list) {
        console.log('doesnt exist')
        const newlist = new List({name: lodash.capitalize(req.params.name), items: defaultItems})
        newlist.save()
        res.redirect('/' + req.params.name)
      } else {
        //Show an existing list

        res.render('list', {listTitle: list.name, newListItems: list.items})
      }
    }
  })

  // list.save();
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
