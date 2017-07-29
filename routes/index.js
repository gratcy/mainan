exports.main = function(req, res) {
	req.getConnection(function(err,connection){
		connection.query('SELECT COUNT(*) as total FROM products_tab WHERE (pstatus=0 OR pstatus=1)',function(err,products) {
			if (err) console.log("Error Selecting : %s ",err );
			connection.query('SELECT COUNT(*) as total FROM customers_tab WHERE (cstatus=0 OR cstatus=1)',function(err,customers) {
				if (err) console.log("Error Selecting : %s ",err );
				connection.query('SELECT COUNT(*) as total FROM transaction_tab WHERE (tstatus=0 OR tstatus=1)',function(err,transaction) {
					if (err) console.log("Error Selecting : %s ",err );
					connection.query('SELECT SUM(a.istock) as total FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0)',function(err,stock) {
						if (err) console.log("Error Selecting : %s ",err );
						res.render('index',{products:products[0],customers:customers[0],transaction:transaction[0],stock:stock[0]});
					});
				});
			});
		});
	});
};

exports.main_stats = function(req, res) {
	req.getConnection(function(err,connection){
		connection.query('SELECT COUNT(*) as total FROM products_tab WHERE (pstatus=0 OR pstatus=1)',function(err,products) {
			if (err) console.log("Error Selecting : %s ",err );
			connection.query('SELECT COUNT(*) as total FROM customers_tab WHERE (cstatus=0 OR cstatus=1)',function(err,customers) {
				if (err) console.log("Error Selecting : %s ",err );
				connection.query('SELECT COUNT(*) as total FROM transaction_tab WHERE (tstatus=0 OR tstatus=1)',function(err,transaction) {
					if (err) console.log("Error Selecting : %s ",err );
					connection.query('SELECT SUM(a.istock) as total FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0)',function(err,stock) {
						if (err) console.log("Error Selecting : %s ",err );
						res.send({products:products[0],customers:customers[0],transaction:transaction[0],stock:stock[0]});
					});
				});
			});
		});
	});
};

