import models_products from '../models/models_products';

exports.list = async function(req, res) {
    var rows = await models_products.get_products(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('products',{perm:true,data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_products.get_products_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('products_add',{error_msg:errorMsg});
};

exports.products_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_products.get_products_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('products_update',{data:rows[0],error_msg:errorMsg});
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
				pkoliqty : input.koliqty,
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
					pkoliqty : input.koliqty,
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

exports.export_product = async function(req,res){
    var rows = await models_products.get_products(req);
	var rdata = 'Product ID,Product Code,Product Name,Price PCS,Price Lusin,Price Dus'+"\r\n";
			for(var i=0;i<rows.length;++i) {
			// console.log(rows[i].pid);
				rdata += rows[i].pid+',"'+rows[i].pcode+'","'+rows[i].pname+'",'+rows[i].ppricepcs+','+rows[i].ppricedozen+','+rows[i].ppricekoli+"\r\n";
			}
	res.set('Content-Type', 'application/octet-stream');
	res.attachment('export_product.csv');
	res.send(rdata);
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
