var inquirer = require("inquirer");
var mysql = require("mysql");
var managerMode = require("./bamazonManager.js");
var quantRemaining;
var itemsNumOrdered;
var itemIdNumber;
var pricePerItem;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"
});

console.log("");
console.log("============================");
console.log("======== WELCOME TO ========");
console.log("========= BAMAZON! =========");
console.log("============================");
console.log("");
console.log("");
console.log("What would you like to do?");

startProgram();

function startProgram() {
inquirer.prompt(
	{
		name: "choice",
		type: "list",
		message: "Choose a menu:",
		choices: ["Customer Order", "Manager View"]
	}
).then(function(answers){

	switch(answers.choice){
		case "Customer Order":
			customerView();
			break;
		case "Manager View":
			managerMode.managerMenu();
			break;
	}
})
}

function customerView() {
// Displays all items in inventory
connection.query("SELECT * FROM products", function(err, res){
	if (err) throw err;

		console.log("======================");
		console.log("===== ITEM LIST ======");
		console.log("======================");
		console.log("");

		for (var i = 0; i < res.length; i++) {
			console.log("==========");
			console.log("Item ID: " + res[i].item_id);
			console.log("Product Name: " + res[i].product_name);
			console.log("Price (per unit): $" + res[i].price);
			console.log("==========");

		}

		console.log("==== END OF LIST ====");
		orderItem();

})
}	




function orderItem() {

	console.log("");
	console.log("Thank you for choosing Bamazon!");
	console.log("Please place your order by entering the information below:");
	console.log("");

inquirer.prompt([

	{
		name: "id",
		message: "Item ID#: ",
		validate: function(input){

	      var test = parseInt(input);
	      // console.log(test);
	      if (isNaN(test) || test < 1001){
	        console.log(" Please enter a valid ID number");
	        return;
	      }

	     return true;
	    } 
	},
	{
		name: "quantity",
		message: "Amount requested: ",
		validate: function(input){

	      var test = parseInt(input);
	      // console.log(test);
	      if (isNaN(test)){
	        console.log(" Please enter a number");
	        return;
	      }

	     return true;
	    } 
	}


]).then(function(answers){

	connection.query("SELECT stock_quantity FROM products WHERE ?",
		[{item_id: answers.id}], 
		function(err, res){
			if (err) throw err;
			// console.log(res[0].stock_quantity);
			quantRemaining = res[0].stock_quantity;
			itemsNumOrdered = parseInt(answers.quantity);

			if (quantRemaining >= itemsNumOrdered){

				newQuant = quantRemaining - itemsNumOrdered;
				itemIdNumber = answers.id;

				updateStock(newQuant, itemIdNumber, itemsNumOrdered);

				console.log("");
				console.log("We have that!");
				console.log("");
			}

			else {

				console.log("");
				console.log("Sorry, we don't have enough :(");
				console.log("");
				inquirer.prompt([
				{
					name: "repeat",
					type: "confirm",
					message: "Would you like to try again?"
				}
				]).then(function(answer){
					// console.log("Answer: " + answer.repeat);
					if (answer.repeat === true) {

						orderItem();
					}
					else {
						
						menuAgain();
					}
				})

		}
	})
})
}

function updateStock(newQuant, itemIdNumber, itemsNumOrdered) {

	console.log("");
	console.log("Checking inventory...");
	console.log("");


	connection.query(
		"UPDATE products SET ? WHERE ?",
		[
		 {
			stock_quantity: newQuant
		 },
		 {
		 	item_id: itemIdNumber
		 }

		],
		function(err, res){
			if (err) throw err;

			total(itemsNumOrdered, itemIdNumber);
			
		}

		);
}
		
function total(itemsNumOrdered, itemIdNumber) {

	connection.query(
		"SELECT price FROM products WHERE ?",
		[{item_id: itemIdNumber}],
		function(err, res){
			if(err) throw err;
			pricePerItem = res[0].price;
			var total = itemsNumOrdered * pricePerItem;
			console.log("=========");
			console.log("Your order has been placed!");
			console.log("Your sales tax is (6.875%): $" + (total*0.06875).toFixed(2));
			console.log("Your total is: $" + (total + (total*0.06875)).toFixed(2));
			console.log("");
			console.log("Thank you for your business!");
			console.log("");

			menuAgain();

		}
		)
}

function menuAgain() {

	inquirer.prompt({

				name: "orderAgain",
				type: "list",
				message: "Is there anything else you would like to do?",
				choices: ["Order another item", "Enter Manager Mode", "Exit"]
			}).then(function(answer){

				switch(answer.orderAgain){
					case "Order another item":
						orderItem();
						break;
					case "Enter Manager Mode":
						managerMode.managerMenu();
						break;
					case "Exit":
						console.log("");
						console.log("Have a great day!");
						console.log("");
						connection.destroy();
						break;
				}
			})
}
