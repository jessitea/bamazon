var inquirer = require("inquirer");
var mysql = require("mysql");
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

		
//export functions to be used in 'bamazonCustomer.js' file
module.exports = {

    //////////////////////////////////////////////////////////////
    //       Function creates menu for 'Manager' features       //
    //////////////////////////////////////////////////////////////
	managerMenu: function() {

		inquirer.prompt({

			name: "menuChoice",
			type: "list",
			message: "Please select what you would like to do:",
			choices: ["View Full Inventory", "Check Low Inventory", "Re-stock Existing Inventory", "Add a New Item to Inventory List", "Exit"]

		}).then(function(answer){

			switch(answer.menuChoice){
				case "View Full Inventory":
					module.exports.viewFullInventory();
					break;
				case "Check Low Inventory":
					module.exports.lowInventory();
					break;
				case "Re-stock Existing Inventory":
					module.exports.addInventory();
					break;
				case "Add a New Item to Inventory List":
					module.exports.addNewItem();
					break;
				case "Exit":
					console.log("");
					console.log("Have a great day!");
					connection.destroy();
					
			}
		})
	},


    //////////////////////////////////////////////////////////////
    //   Function shows entire inventory, including quantity    //
    //////////////////////////////////////////////////////////////
	viewFullInventory: function() {

        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;

            console.log("======================");
            console.log("===== INVENTORY ======");
            console.log("======================");
            console.log("");

            for (var i = 0; i < res.length; i++) {

                console.log("==========");
                console.log("Item ID: " + res[i].item_id);
                console.log("Product Name: " + res[i].product_name);
                console.log("Price (per unit): $" + (res[i].price).toFixed(2));
                console.log("Quantity in stock: " + res[i].stock_quantity);
                console.log("==========");

            }

            console.log("==== END OF LIST ====");

            //after viewing full inventory, 'Manager' menu function is called
            module.exports.managerMenu();

        });
    },


    //////////////////////////////////////////////////////////////
    // Function shows items that have stock between '0' and '5' //
    //////////////////////////////////////////////////////////////
	lowInventory: function() {

        connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN ? AND ?", [0, 5],

            function(err, res) {

                if (err) throw err;

                // console.log(res[0].item_id);

                if (res != "") { //if statement stating, if the results of the query isn't a blank array, display the results

                    //Title
                    console.log("");
                    console.log("======== LOW =========");
                    console.log("======= STOCK ========");
                    console.log("======= ITEMS ========");
                    console.log("");

                    //For loop to show results
                    for (var i = 0; i < res.length; i++) {

                        console.log("==========");
                        console.log("Item ID: " + res[i].item_id);
                        console.log("Product Name: " + res[i].product_name);
                        console.log("Price (per unit): $" + (res[i].price).toFixed(2));
                        console.log("Quantity in stock: " + res[i].stock_quantity);
                        console.log("==========");

                    } // end of for loop

                    //After loop, prompts user
                    inquirer.prompt([{
                            name: "restock",
                            type: "confirm",
                            message: "Would you like to restock an item?"
                        }

                    ]).then(function(answer) {

                        if (answer.restock === true) {

                            module.exports.addInventory(); 

                        } else {
                            
                            module.exports.managerMenu();
                        }
                    }) 
                } 

                // If results are blank, this means no items are low, user is notified and prompted back to menu
                else {

                	console.log("");
                    console.log("All your items have sufficient quantity!");
                    console.log("");

                    module.exports.managerMenu();
                }

            } 
        ) 

    }, 


    ////////////////////////////////////////////////////////////////
    // Function adds inventory to database for exisiting product //
    //////////////////////////////////////////////////////////////
    addInventory: function() {

    	console.log("");
        console.log("");
        console.log("Please enter the information below to restock your item:");
        console.log("");
        console.log("");

        inquirer.prompt([

            {
                name: "id",
                message: "Item ID#: ",
                validate: function(input) {

                    var test = parseInt(input);
                    // console.log(test);
                    if (isNaN(test) || test < 1001) {
                        console.log(" Please enter a valid ID number");
                        return;
                    }

                    return true;
                }
            },
            {
                name: "quantity",
                message: "Number of Units: ",
                validate: function(input) {

                    var test = parseInt(input);
                    // console.log(test);
                    if (isNaN(test)) {
                        console.log(" Please enter a number");
                        return;
                    }

                    return true;
                }
            }


        ]).then(function(answers) {

            // Queries all columns from 'products' table where item ID matches
            connection.query("SELECT * FROM products WHERE ?", 
                [{
                    item_id: answers.id
                }],
                function(err, res) {
                    if (err) throw err;
                    
                    //assigns new variable to 'stock quantity'(quantity from database) result of the query
                    quantRemaining = res[0].stock_quantity;

                    //assigns new variable to answer from inquirer question
                    itemsNumOrdered = parseInt(answers.quantity);

                    //adds existing quantity in db to user's input from inquirer question
                    newQuant = quantRemaining + itemsNumOrdered;

                    //assigns user's input from inquirer question to new variable
                    itemIdNumber = answers.id;

                    // Additional query updates quantities by item id
                    connection.query(
                        "UPDATE products SET ? WHERE ?", [
                            {
                                stock_quantity: newQuant
                            },
                            {
                                item_id: itemIdNumber
                            }

                        ],

                        function(err, res) {
                            if (err) throw err;

                            //user notified item has been successfully restocked and given prompt
                            console.log("");
                            console.log("Item Restocked!");
                            console.log("");

                            inquirer.prompt(
                                {
                                    name: "restock",
                                    type: "confirm",
                                    message: "Would you like to restock another item?"
                                }
                            ).then(function(answer) {

                                if (answer.restock === true) {

                                    module.exports.addInventory();

                                } else {

                                    module.exports.managerMenu();             

                                }
                            })
                        }
                    )
                }
            )
        })
    },

    /////////////////////////////////////////
    // Function adds new item to database //
    ///////////////////////////////////////
    addNewItem: function() {

    	console.log("");
    	console.log("======= ADD A NEW ITEM =======");
    	console.log("");
    	console.log("Please enter the following information:")

        //Prompts user for necessary info for new product
    	inquirer.prompt([
    		{
    			name: "idNumber",
    			message: "New product ID number:",
    			validate: function(input) {

    	                var test = parseInt(input);
    	                // console.log(test);
    	                if (isNaN(test) || test <= 1010) {
    	                    console.log(" Please enter a valid ID number, greater than 1010");
    	                    return;
    	                }

    	                return true;
    	            }
    		},
    		{
    			name: "productName",
    			message: "New product name:"
    		},
    		{
    			name: "department",
    			message: "Department of new product:"
    		},
    		{
    			name: "price",
    			message: "Price of product (per unit): $",
    			validate: function(input) {

    	                var test = parseInt(input);
    	                // console.log(test);
    	                if (isNaN(test)) {
    	                    console.log(" Please enter a valid ID number");
    	                    return;
    	                }

    	                return true;
    	            }

    		},
    		{
    			name: "stockAmt",
    			message: "Number of units of new product:",
    			validate: function(input) {

    	                var test = parseInt(input);
    	                // console.log(test);
    	                if (isNaN(test)) {
    	                    console.log(" Please enter a valid ID number");
    	                    return;
    	                }

    	                return true;
    	            }
    		}

    	]).then(function(answers){

    		// User's values from inquirer are put into corresponding columns
    		connection.query("INSERT INTO products SET ?, ?, ?, ?, ?",
    			[
    			{
    				item_id: parseInt(answers.idNumber)
    			},
    			{
    				product_name: answers.productName
    			},
    			{
    				department_name: answers.department
    			},
    			{
    				price: parseFloat(answers.price).toFixed(2)
    			},
    			{
    				stock_quantity: parseInt(answers.stockAmt)
    			}
    			],
    			function(err, res){

    				if (err) throw err;

                    // User notified if item is added and prompted with options
    				console.log("");
    				console.log("Product: " + answers.productName);
    				console.log("");
    				console.log("New item added!");
    				console.log("");

    				inquirer.prompt([
                        {
                            name: "add",
                            type: "confirm",
                            message: "Would you like to add another item?"
                        }

                        ]).then(function(answer) {

                            if (answer.add === true) {

                                module.exports.addNewItem();

                            } else {

                                module.exports.managerMenu();

                             }
                        })
    			}
    		)

    	})
    }
}

