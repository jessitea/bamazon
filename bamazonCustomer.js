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

// Welcome title
console.log("");
console.log("============================");
console.log("======== WELCOME TO ========");
console.log("========= BAMAZON! =========");
console.log("============================");
console.log("");
console.log("");
console.log("What would you like to do?");

// Calls program to start when file is loaded
startProgram();

/////////////////////////////////////////
//    Function to view start menu     //
///////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////////////////////////
// Function shows all items (without quanitity) then calls function to place an order //
///////////////////////////////////////////////////////////////////////////////////////
function customerView() {

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
			console.log("Price (per unit): $" + (res[i].price).toFixed(2));
			console.log("==========");

		}

		console.log("==== END OF LIST ====");


		orderItem();

	})
}	


/////////////////////////////////
// Function to place an order //
///////////////////////////////
function orderItem() {

	console.log("");
	console.log("Thank you for choosing Bamazon!");
	console.log("Please place your order by entering the information below:");
	console.log("");

		// Prompts user for info to order
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

			// queries database for stock_quantity column, according to item_id
			connection.query("SELECT stock_quantity FROM products WHERE ?",
				[{item_id: answers.id}], 

				function(err, res){
					if (err) throw err;
					
					//assigns new variable to 'stock quantity'(quantity from database) result of the query
					quantRemaining = res[0].stock_quantity;

					//assigns new variable to answer from inquirer question
					itemsNumOrdered = parseInt(answers.quantity);

					//if quantity value in database is greater than the amount ordered, the order will proceed
					if (quantRemaining >= itemsNumOrdered){

						newQuant = quantRemaining - itemsNumOrdered;
						itemIdNumber = answers.id;

						//Function to update stock is called, passing in appropriate parameters
						updateStock(newQuant, itemIdNumber, itemsNumOrdered);

						console.log("");
						console.log("We have that!");
						console.log("");
					}

					//if quantity value in database is less than the amount ordered, the order will not go through
					else {

						console.log("");
						console.log("Sorry, we don't have enough :(");
						console.log("");

						// user will be prompted for other options
						inquirer.prompt([
						{
							name: "repeat",
							type: "confirm",
							message: "Would you like to try again?"
						}
						]).then(function(answer){
							
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

///////////////////////////////////////////////////////////////
// Function updates stock in database after order is placed //
/////////////////////////////////////////////////////////////
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

			// Function to calculate total cost is called, passing in appropriate parameters
			total(itemsNumOrdered, itemIdNumber);
			
		}

	)
}

//////////////////////////////////////////////////////////////////////////////
// Function creates + displays total amt for customer when order is placed //
////////////////////////////////////////////////////////////////////////////		
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

			//calls function to display menu
			menuAgain();
		}
	)
}

/////////////////////////////////////////////////
// Function to display menu with more options //
///////////////////////////////////////////////
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
				process.exit(-1);
				
		}
	})
}
