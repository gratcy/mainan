import models_order from '../models/models_order';
import models_products from '../models/models_products';
import models_customers from '../models/models_customers';

exports.list = async function(req, res) {
	delete req.session.order_products;
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);

	res.render('order',{error_msg:errorMsg});
};

exports.list_datatables = async function(req, res) {
	var params = req.query;
	var draw = params.draw;
    var rows = await models_order.get_order(req,params);
    var total = await models_order.get_order_total(req,params);
	var data = [];
	
	for(var i=0;i<rows.length;++i) {
		var execute = '<a href="'+helpers.__site_url('order/order_update/'+rows[i].tid)+'"><i class="fa fa-pencil"></i></a> <a href="'+helpers.__site_url('order/order_update/'+rows[i].tid)+'" onclick="return confirm(\'Are you sure you want to delete this item?\');"><i class="fa fa-times"></i></a>';
		if (!helpers.__check_permission('OrderExecute')) {
			execute = '';
		}
		
		data.push([rows[i].tno,helpers.__get_date(rows[i].tdate,2),rows[i].cname,rows[i].tqty,helpers.__number_format(rows[i].tammount,0,'',','),helpers.__number_format(rows[i].tdiscount,0,'',','),helpers.__number_format(rows[i].ttotal,0,'',','),(rows[i].tstatus == 3 ? helpers.__parse_json(rows[i].tapprovedby,'uemail') : helpers.__parse_json(rows[i].tcreatedby,'uemail')),execute]);
	}
	
	res.send({data:data,draw:draw,recordsTotal:total[0].total,recordsFiltered:total[0].total});
};

exports.products_delete = function(req, res) {
	var input = req.body;
	if (input.type == 1) {
		var pids = req.session.order_products;
		var tmpPids = [];
		for(var i=0;i<pids.length;++i) {
			var index = parseInt(pids[i]);
			if (!isNaN(index)) {
				if (index > 0 && input.pid != index) {
					tmpPids.push(index);
				}
			}
		}
		req.session.order_products = {};
		req.session.order_products = tmpPids;
		res.send('-1');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				tstatus : 2
			};
			
			connection.query("UPDATE transaction_detail_tab SET ? WHERE ttid = ? AND tpid = ? ",[data,input.tid,input.pid], function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					res.send('-1');
				}
				else {
					res.send('12');
				}
			});
		});
	}
};

exports.products_add = async function(req, res) {
	var input = req.body;
	var pids = input.pid;
	var oid = parseInt(input.oid);

	const getProductById = (data, pid) => {
		const productDetail = []
		const totalData = _.result(data, 'length', 0) || _.size(data)

		for(var i=0;i<totalData;++i) {
			if (parseInt(pid) == parseInt(data[i].pid)) {
				productDetail.push(data[i])
			}
		}
		return productDetail
	}

	if (typeof(pids) != 'undefined') {
		if (input.type == 1) {
			if (typeof req.session.order_products != 'undefined') {
				var target = pids.concat(req.session.order_products);
				req.session.order_products = {};
				req.session.order_products = target;
				req.session.save();
			}
			else {
				req.session.order_products = pids;
				req.session.save();
			}

			memcached.get('tmpProduct', async (err, rows) => {
				if (rows) {
					res.send({status: '-1', product: getProductById(rows, pids[0])});
				}
				else {
					var allProduct = await models_products.get_all_products_order(req);
					memcached.set('tmpProduct', allProduct, 7200, function (err) {
						if (err) console.error(err)
					});
					res.send({status: '-1', product: getProductById(allProduct, pids[0])});
				}
			})
		}
		else {
			if (oid) {
				var ck = await models_order.get_product_exists(req, oid, pids);
				
				if (ck[0]) {
					res.send('-1');
				}
				else {
					var data = {
						ttid : oid,
						tpid : pids,
						tqty : 1,
						tstatus : 1
					};
					req.getConnection(function (err, connection) {
						var query = connection.query("INSERT INTO transaction_detail_tab SET ? ",data, function(err, rows) {
							res.send('-1');
						});
					});
				}
			}
			else {
				res.send('1');
			}
		}
	}
	else {
		res.send('1');
	}
};

exports.list_products = async function(req, res) {
	var type = req.params.id;
    var rows = await models_order.get_list_products(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('./tmp/order_list_products',{data:rows,type:type,error_msg:errorMsg,layout:false});
};

exports.products = async function(req, res) {
	var id = req.params.id;
	var pids;
	
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	if (id > 0) {
		var rows = await models_order.get_order_products(req,1,id);

		if (rows)
			res.render('./tmp/order_products',{tid:id,data:rows,type:2,error_msg:errorMsg,layout:false});
		else
			res.end();
	}
	else {
		if (typeof req.session.order_products != 'undefined') {
			pids = req.session.order_products;
			var tpids = '';
			for(var i=0;i<pids.length;++i) {
				var index = parseInt(pids[i]);
				if (!isNaN(index)) {
					if (index > 0) {
						tpids += index + ',';
					}
				}
			}
			
			if (tpids)
				pids = tpids.slice(0,-1);
			else
				pids = 0;
		}
		else {
			pids = 0;
		}
		
		var rows = await models_order.get_order_products(req,2,pids);
		if (rows)
			res.render('./tmp/order_products',{tid:0,data:rows,type:1,error_msg:errorMsg,layout:false});
		else
			res.end();
	}
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('order_add',{error_msg:errorMsg});
};

exports.order_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_order.get_order_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('order_update',{id:id,data:rows[0],error_msg:errorMsg});
};

exports.order_detail_approved = async function(req, res) {
	var id = req.params.id;
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    var rows = await models_order.get_order_detail_approved(req, 1, id);
    var drows = await models_order.get_order_detail_approved(req, 2, id);
	
	res.render('order_detail',{id:id,products:drows,data:rows[0],error_msg:errorMsg});
};

exports.order_add = async function(req,res) {
	var input = req.body;
	var retail = input.retail;

	if (!input.waktu) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/order/order_add');
	}
	else {
		var newcust = input.newcust;
		var customer = input.customer;
		var ppricepcs = input.ppricepcs;
		var ppricedozen = input.ppricedozen;
		var ppricekoli = input.ppricekoli;
		
		var base_ppricepcs = input.base_ppricepcs;
		var base_ppricedozen = input.base_ppricedozen;
		var base_ppricekoli = input.base_ppricekoli;
	
		var products = input.products;
		var optype = input.optype;
		var tdisc = parseFloat(input.disc.replace(/(\,|\.)/g, ""));
		var ttotal = 0;
		var tammount = 0;
		
		if (newcust == 0 && !customer) {
			helpers.__set_error_msg({error: 'Customer harus di isi !!!'},req.sessionID);
			res.redirect('/order/order_add');
		}
		else if (newcust == 1 && !input.nname) {
			helpers.__set_error_msg({error: 'Customer harus di isi !!!'},req.sessionID);
			res.redirect('/order/order_add');
		}
		else {
			if (newcust == 1) {
				var dataCustomer = {
					ctype : 1,
					cname : input.nname,
					cemail : input.nemail,
					cphone : input.nphone1+'*'+input.nphone2,
					cstatus : 1
				}
				
				var insCust = await models_customers.insert_customers(req, dataCustomer);
				customer = insCust.insertId;
			}
			else {
				var dataCustomer = {
					cname : input.oname,
					cemail : input.oemail,
					cphone : input.ophone1+'*'+input.ophone2
				}
				var uptCust = await models_customers.update_customers(req, dataCustomer, customer);
			}
			
			req.getConnection(function (err, connection) {
				var str = input.waktu;
				var strdate = str.split(" ");
				var dt = strdate[0];
				var rres = dt.split("/").reverse().join("-") + ' ' + strdate[1];
				var waktu = new Date(rres).getTime() / 1000;
				
				var udate = helpers.__get_date('',2);
				var tqty = 0;
				
				if (typeof products != 'undefined') {
					Object.keys(products).map(function(objectKey, index) {
						var index = parseInt(objectKey);
						if (!isNaN(index)) {
							if (index > 0) {
								if (optype[index] == 1) {
									if (!parseFloat(ppricedozen[index])) tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
									else tammount += parseInt(products[index]) * parseFloat(ppricedozen[index]);
								}
								else if (optype[index] == 2) {
									if (!parseFloat(ppricepcs[index])) tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
									else tammount += parseInt(products[index]) * parseFloat(ppricekoli[index]);
								}
								else {
									if (retail == 1) {
										if (!parseFloat(ppricedozen[index])) tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
										else tammount += parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
									}
									else {
										tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
									}
								}
								
								tqty += parseInt(products[index]);
							}
						}
					});
				}
				
				var data = {
					tuid : sauth.uid,
					ttype : 1,
					tretail : retail,
					tdate : waktu,
					tcid : customer,
					tqty : tqty,
					tammount : tammount,
					tdiscount : tdisc,
					ttotal : (tammount - tdisc),
					tdesc : input.desc,
					tcreatedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
					tstatus : input.status
				};
				
				var query = connection.query("INSERT INTO transaction_tab SET ? ",data, function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
						res.redirect('/order');
					}
					else {
						var rdata = [];
						var ttid = rows.insertId;
						
						if (typeof products != 'undefined') {
							Object.keys(products).map(function(objectKey, index) {
								var index = parseInt(objectKey);
								if (!isNaN(index)) {
									if (index > 0) {
										var value = products[index];
										var tprice = 0;
										var tpricebase = 0;
										
										if (optype[index] == 1) {
											tprice = parseInt(products[index]) * parseFloat(ppricedozen[index]);
											if (!tprice) tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
											tpricebase = parseInt(products[index]) * parseFloat(base_ppricedozen[index]);
										}
										else if (optype[index] == 2) {
											tprice = parseInt(products[index]) * parseFloat(ppricekoli[index]);
											if (!tprice) tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
											tpricebase = parseInt(products[index]) * parseFloat(base_ppricekoli[index]);
										}
										else {
											if (retail == 1) {
												tprice = parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
												if (!tprice) tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
												tpricebase = parseInt(products[index]) * (parseFloat(base_ppricedozen[index]) / 12);
											}
											else {
												tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
												tpricebase = parseInt(products[index]) * parseFloat(base_ppricepcs[index]);
											}
										}
										rdata.push([ttid,index,tprice,tpricebase,parseInt(value),optype[index],1]);
									}
								}
							});
							
							var query = connection.query("INSERT INTO transaction_detail_tab (ttid,tpid,tprice,tpricebase,tqty,ttype,tstatus) VALUES ?",[rdata], function(err, rows) {
								if (err) {
									console.log("Error Selecting : %s ",err );
								}
							});
						}
						
						connection.query('SELECT COUNT(*) as totaltoday FROM transaction_tab WHERE ttype=1 AND tstatus!=2 AND FROM_UNIXTIME(tdate, "%Y-%m-%d")=DATE_FORMAT(NOW(),"%Y-%m-%d")',function(err,ckt) {
							var str = helpers.__get_date();	
							var dt = str.replace(/\//g, "");
							var tno = 'PO'+dt+helpers.__strpad('0000',(parseInt(ckt[0].totaltoday)+1),true);
							var vdata = {
								tno : tno
							};
							
							connection.query("UPDATE transaction_tab SET ? WHERE tid = ? ",[vdata,ttid], function(err, rows) {
								if (err) {
									console.log("Error Selecting : %s ",err );
								}
							});
						});
							
						helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
						res.redirect('/order/order_detail/' + ttid);
					}
				});
			});
		}
	}
};

exports.order_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	var retail = input.retail;
	if (id) {
		if (!input.waktu || !input.customer) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/order/order_update/' + id);
		}
		else {
			var ppricepcs = input.ppricepcs;
			var ppricedozen = input.ppricedozen;
			var ppricekoli = input.ppricekoli;
			
			var base_ppricepcs = input.base_ppricepcs;
			var base_ppricedozen = input.base_ppricedozen;
			var base_ppricekoli = input.base_ppricekoli;
			
			var products = input.products;
			var optype = input.optype;
			var koliqty = input.koliqty;
			var tdisc = parseFloat(input.disc.replace(/(\,|\.)/g, ""));
			var ttotal = 0;
			var tammount = 0;
			
			req.getConnection(function (err, connection) {
				var app = input.app;
				var status = input.status;
				var rapproved = '';
				
				if (app == 1) {
					rapproved = JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate});
					status = 3;
				}
					
				var str = input.waktu;
				var strdate = str.split(" ");
				var dt = strdate[0];
				var rres = dt.split("/").reverse().join("-") + ' ' + strdate[1];
				var waktu = new Date(rres).getTime() / 1000;
			
				var udate = helpers.__get_date('',2);
				var tqty = 0;
				
				if (typeof products != 'undefined') {
					Object.keys(products).map(function(objectKey, index) {
						if (objectKey !== null) {
							var index = parseInt(objectKey);
							var value = (isNaN(products[index]) == true ? 0 : parseInt(products[index]));
							value = (isNaN(value) ? 0 : value);
							
							if (!isNaN(index)) {
								if (index > 0) {
									if (optype[index] == 1) {
										if (!parseFloat(ppricedozen[index])) tammount += value * parseFloat(ppricepcs[index]);
										else tammount += value * parseFloat(ppricedozen[index]);
									}
									else if (optype[index] == 2) {
										if (!parseFloat(ppricekoli[index])) tammount += value * parseFloat(ppricepcs[index]);
										else tammount += value * parseFloat(ppricekoli[index]);
									}
									else {
										if (retail == 1) {
											if (!parseFloat(ppricedozen[index])) tammount += value * parseFloat(ppricepcs[index]);
											else tammount += value * (parseFloat(ppricedozen[index]) / 12);
										}
										else {
											tammount += value * parseFloat(ppricepcs[index]);
										}
									}
									
									tqty += value;
								}
							}
						}
					});
				}
				
				var data = {
					tretail : retail,
					tdate : waktu,
					tcid : input.customer,
					tqty : tqty,
					tammount : tammount,
					tdiscount : tdisc,
					ttotal : (tammount - tdisc),
					tdesc : input.desc,
					tmodifiedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
					tapprovedby : rapproved,
					tstatus : status
				};
				
				connection.query("UPDATE transaction_tab set ? WHERE tid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/order');
					}
					else {
						var rdata = [];
						var ttid = id;
						
						if (typeof products != 'undefined') {
							Object.keys(products).map(function(objectKey, index) {
								if (objectKey !== null) {
									var index = parseInt(objectKey);
									if (!isNaN(index)) {
										if (index > 0) {
											var value = (isNaN(products[index]) == true ? 0 : parseInt(products[index]));
											value = (isNaN(value) ? 0 : value);
											var tprice = 0;
											var tpricebase = 0;
											
											if (optype[index] == 1) {
												tprice = value * parseFloat(ppricedozen[index]);
												if (!tprice) tprice = value * parseFloat(ppricepcs[index]);
												tpricebase = value * parseFloat(base_ppricedozen[index]);
											}
											else if (optype[index] == 2) {
												tprice = value * parseFloat(ppricekoli[index]);
												if (!tprice) tprice = value * parseFloat(ppricepcs[index]);
												tpricebase = value * parseFloat(base_ppricekoli[index]);
											}
											else {
												if (retail == 1) {
													tprice = value * (parseFloat(ppricedozen[index]) / 12);
													if (!tprice) tprice = value * parseFloat(ppricepcs[index]);
													tpricebase = value * (parseFloat(base_ppricedozen[index]) / 12);
												}
												else {
													tprice = value * parseFloat(ppricepcs[index]);
													tpricebase = value * parseFloat(base_ppricepcs[index]);
												}
											}
											
											var rdata = {
												tprice: tprice,
												tpricebase: tpricebase,
												tqty: value,
												ttype: optype[index]
											}
											
											connection.query("UPDATE transaction_detail_tab SET ? WHERE ttid = ? AND tpid = ? ",[rdata,ttid,index], function(err, rows) {
												
											});
											
											if (app == 1) {
												connection.query('SELECT * FROM inventory_tab WHERE istatus=1 AND ipid=' + index,function(ierr,inv) {
													if (ierr) {
														console.log("Error Selecting : %s ",ierr );
													}
													else {
														let valueQTY = value
														if (optype[index] == 0)
															valueQTY = value
														else if (optype[index] == 1)
															valueQTY = parseInt(value) * 12
														else
															valueQTY = parseInt(koliqty[index]) * parseInt(value)

														var idata = {
															istockout : (parseInt(inv[0].istockout) + parseInt(valueQTY)),
															istock : (parseInt(inv[0].istock) - parseInt(valueQTY))
														};
														
														connection.query("UPDATE inventory_tab SET ? WHERE iid = ? ",[idata,inv[0].iid], function(err, rows) {
															
														});
													}
												});
											}
										}
									}
								}
							});
						}
						
						if (app == 1) {
							helpers.__set_error_msg({info : 'Data berhasil diapproved.'},req.sessionID);
							res.redirect('/order/order_detail/' + ttid);
						}
						else {
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/order/order_detail/' + ttid);
						}
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/order');
	}
};

exports.order_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			tstatus : 2
		};
		
		connection.query("UPDATE transaction_tab SET ? WHERE tid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/order');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/order');
			}
		});
	});
};


exports.order_faktur = async function(req,res){
	var id = req.params.id;
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    var rows = await models_order.get_order_detail_approved(req, 1, id);
    var drows = await models_order.get_order_detail_approved(req, 2, id);
	var arows = [];
	
	for(var i=0;i<drows.length;++i) {
		arows.push({tqty:drows[i].tqty,tprice:drows[i].tprice,pname:drows[i].pname,ppricedozen:drows[i].ppricedozen,cname:drows[i].cname,pdesc:drows[i].pdesc,ttype:drows[i].ttype,tretail:rows[0].tretail});
	}
	console.log(drows);
	res.render('print/faktur',{rows:rows[0],products:arows,error_msg:errorMsg,layout:false});
};
