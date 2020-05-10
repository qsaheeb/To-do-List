//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const favicon = require('serve-favicon');

const app = express();

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
  );
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

mongoose.connect("mongodb+srv://admin-qsaheeb93:Alh@mdul!l@h@cluster0-exety.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- hit this to delete an item.",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Succcessfully saved!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});

app.get("/:customlistName", (req, res) => {
  customlistName = _.capitalize(req.params.customlistName) ;
  List.findOne(
    {
      name: customlistName
    },
    (err, foundList) => {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: customlistName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customlistName);
        } else {
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          });
        }
      }
    }
  );
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    console.log("Entered");
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
        name : listName
      }, function(err,foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
      });
    }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemId, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Item Removed!");
      res.redirect("/");
    }
    });
  } else  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},(err,foundList)=>{
      if(!err)  {
        res.redirect("/"+ listName);
      }
    })
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
