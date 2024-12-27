const express = require('express')
const mongoose = require('mongoose')
const _ = require('lodash')
const date = require(__dirname + '/date.js')
const app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

mongoose.connect('mongodb://localhost:27017/testingforgood')

const listSchema = new mongoose.Schema({
	itemName: String,
})

const List = new mongoose.model('list', listSchema)

const listItem1 = new List({
	itemName: 'Buy Food',
})
const listItem2 = new List({
	itemName: 'Cook Food',
})
const listItem3 = new List({
	itemName: 'Eat Food',
})

const defaultItems = [listItem1, listItem2, listItem3]

const customListSchema = new mongoose.Schema({
	customListName : String
	, customListItems: [listSchema] 
})

const CustomList = new mongoose.model('CustomList', customListSchema)


const currentDate = date.getFullDate().trim()


app.get('/', (req, res) => {
	List.find({}, (err, foundNames) => {
		if (!err) {
			if (foundNames.length === 0) {
				List.insertMany(defaultItems, err => {
					if (!err) {
						res.redirect('/')
					}
				})
			} else {
				res.render('home', { listItems: foundNames, listName : currentDate} )
			}
		}
	})
})

app.get('/:customList', (req, res) => {
	const customListTitle =  _.capitalize(req.params.customList)

	CustomList.findOne({ customListName: customListTitle }, (err, foundedList) => {
		if(!err){

			if(!foundedList){
				const defaultCustomList = new CustomList({
					customListName : customListTitle,
					customListItems : [...defaultItems]
			})
			defaultCustomList.save((err) => {
				if(!err){
					res.redirect('/'+ customListTitle)
				}
			})
		} else {
			res.render('home', {listItems: foundedList.customListItems, listName: foundedList.customListName})
		}
	}
	})



})

app.post('/add', (req, res) => {
	const requestedItemToAdd = req.body.listName
	const requestedItem = req.body.input
	const newItem = new List({
		itemName: requestedItem
	})
	if(requestedItemToAdd == currentDate){
		newItem.save((err) => {
			if(!err) {
				res.redirect("/")
			}
		})
	} else {
		CustomList.findOne({customListName: requestedItemToAdd}, (err, foundedCustomList) => {
			if(!err){
				foundedCustomList.customListItems.push(newItem)
				foundedCustomList.save((err) => {
					if(!err){
						res.redirect('/' + requestedItemToAdd)
					} else {
						console.log(err)
					}
				})
			}
		})
	}
})

app.post('/delete', (req, res) => {
	const deleteRequestedItem = req.body.idOfItems.trim()
	const listTitle = req.body.listTitle

	if(listTitle == currentDate ){ 
		
		List.findByIdAndRemove( deleteRequestedItem , (err) => {
			if(!err){
				res.redirect("/")
			} else {
				console.log(err)
			}
		})
		
	} else {
		CustomList.findOneAndUpdate({customListName: listTitle}, {$pull : {customListItems: {_id: deleteRequestedItem}}}, (err, deletedUser) => {
			if(!err){
				res.redirect('/' + listTitle)
			}
		})
	}

})

app.use((req, res, next, err) => {console.log(err)})

app.listen(3000)
