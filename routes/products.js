exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pstatus=1 OR a.pstatus=0) ORDER BY a.pid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('products',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_ajax = function(req, res) {
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT pid as id,pname as value FROM products_tab WHERE (pstatus=1 OR pstatus=0)',function(err,rows) {
			if (err) console.log("Error Selecting : %s ",err );
				res.send({data:rows});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('products_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.products_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM products_tab WHERE pid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('products_update',{data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.products_add = function(req,res) {
	var input = req.body;
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/products/products_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var pricepcs = input.pricepcs;
				pricepcs = pricepcs.replace(/(\,|\.)/g, "");
			var pricedozen = input.pricedozen;
				pricedozen = pricedozen.replace(/(\,|\.)/g, "");
			var pricekoli = input.pricekoli;
				pricekoli = pricekoli.replace(/(\,|\.)/g, "");
			var pricebasepcs = input.pricebasepcs;
				pricebasepcs = pricebasepcs.replace(/(\,|\.)/g, "");
			var pricebasedozen = input.pricebasedozen;
				pricebasedozen = pricebasedozen.replace(/(\,|\.)/g, "");
			var pricebasekoli = input.pricebasekoli;
				pricebasekoli = pricebasekoli.replace(/(\,|\.)/g, "");
			
			var data = {
				pcid : input.cid,
				pdate : helpers.__get_date_now(),
				pname : input.name,
				pdesc : input.desc,
				ppricebasepcs : pricebasepcs,
				ppricebasedozen : pricebasedozen,
				ppricebasekoli : pricebasekoli,
				ppricepcs : pricepcs,
				ppricedozen : pricedozen,
				ppricekoli : pricekoli,
				pstatus : input.status
			};

			var query = connection.query("INSERT INTO products_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/products');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/products');
				}
			});
		});
	}
};

exports.products_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/products/products_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var pricepcs = input.pricepcs;
					pricepcs = pricepcs.replace(/(\,|\.)/g, "");
				var pricedozen = input.pricedozen;
					pricedozen = pricedozen.replace(/(\,|\.)/g, "");
				var pricekoli = input.pricekoli;
					pricekoli = pricekoli.replace(/(\,|\.)/g, "");
				var pricebasepcs = input.pricebasepcs;
					pricebasepcs = pricebasepcs.replace(/(\,|\.)/g, "");
				var pricebasedozen = input.pricebasedozen;
					pricebasedozen = pricebasedozen.replace(/(\,|\.)/g, "");
				var pricebasekoli = input.pricebasekoli;
					pricebasekoli = pricebasekoli.replace(/(\,|\.)/g, "");
				
				var data = {
					pcid : input.cid,
					pdate : helpers.__get_date_now(),
					pname : input.name,
					pdesc : input.desc,
					ppricebasepcs : pricebasepcs,
					ppricebasedozen : pricebasedozen,
					ppricebasekoli : pricebasekoli,
					ppricepcs : pricepcs,
					ppricedozen : pricedozen,
					ppricekoli : pricekoli,
					pstatus : input.status
				};
				
				connection.query("UPDATE products_tab set ? WHERE pid = ? ",[data,id], function(err, rows) {
					if (parseInt(pricepcs) !== parseInt(input.tmppricepcs) || parseInt(pricedozen) !== parseInt(input.tmppricedozen) || parseInt(pricekoli) !== parseInt(input.tmppricekoli) || parseInt(pricebasepcs) !== parseInt(input.tmppricebasepcs) || parseInt(pricebasedozen) !== parseInt(input.tmppricebasedozen) || parseInt(pricebasekoli) !== parseInt(input.tmppricebasekoli)) {
						var rdata = {
							ppid : id,
							pdate : helpers.__get_date_now(),
							ppricebasepcs : pricebasepcs,
							ppricebasedozen : pricebasedozen,
							ppricebasekoli : pricebasekoli,
							ppricepcs : pricepcs,
							ppricedozen : pricedozen,
							ppricekoli : pricekoli,
							pstatus : 1
						}
						connection.query("INSERT INTO product_price_tab SET ? ",rdata, function(err, rows) {
								if (err) {
									console.log("Error Selecting : %s ",err );
								}
						});
					}
					
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/products');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/products');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/products');
	}
};

exports.products_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			pstatus : 2
		};
		
		connection.query("UPDATE products_tab SET ? WHERE pid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/products');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/products');
			}
		});
	});
};
