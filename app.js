const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express();

// var items = ["Buy Food" , "Cook Food", "Eat Food"];
// var workListItems = [];

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));  // To use the body Parser

app.use(express.static("public"));


// connect mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
    name: String
}; 

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Welcome to your toDolist!"
})

const item2 = new Item ({
  name: "Hit the + button to add a new item. "
})

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
})

const defaultsItems = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema)

app.get("/",function(req,res){

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultsItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfull");
        }
      })
      res.redirect("/")
    }else {
      res.render("list",{
        listTitle: "Today",
        newListItems: foundItems
      });
    }
   
  })

});

app.get("/:customListName",function (req,res){
  const customName = _.capitalize(req.params.customListName)

  List.findOne({name: customName},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: customName,
          items: defaultsItems
        })
        list.save()
        res.redirect("/"+customName)
      }else{
        // Show Existing list
        res.render("list",{listTitle: foundList.name , newListItems: foundList.items})
      }
    }
  })

})

app.post("/",function(req,res){    // To handle the post request from the list.ejs
  var itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  })


  if(listName === "Today"){
    item.save();

    res.redirect("/")
  }else{
    List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save()
        res.redirect('/'+listName)
    })
  }
})

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else {
        console.log("Successfully removed the item");
        res.redirect("/")
      }
    })
  }else {
     List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+ listName)
      }
     })
  }

 
})

app.get("/work",function(req,res){

  res.render("list",{
    listTitle: "Work List",
    newListItems: workListItems
  })
})

app.get("/about",function(req,res){
  res.render("about");
})


app.listen(3000,function(){
  console.log("Server Started at port 3000");
})

// lets make it Awesome