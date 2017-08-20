import models_retur from '../models/models_retur';

exports.list = async function(req, res) {
	req.session.retur_products = {};
    var rows = await models_retur.get_retur(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('retur',{data:rows,error_msg:errorMsg});
};

exports.products_delete = function(req, res) {
	var input = req.body;
	if (input.type == 1) {
		var pids = req.session.retur_products;
		var tmpPids = [];
		for(var i=0;i<pids.length;++i) {
			var index = parseInt(pids[i]);
			if (!isNaN(index)) {
				if (index > 0 && input.pid != index) {
					tmpPids.push(index);
				}
			}
		}
		req.session.retur_products = {};
		req.session.retur_products = tmpPids;
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
					res.send('1');
				}
			});
		});
	}
};

exports.products_add = function(req, res) {
	var input = req.body;
	var pids = input.pid;
	
	if (typeof(pids) != 'undefined') {
		if (input.type == 1) {
			if (typeof req.session.retur_products != 'undefined') {
				var target = pids.concat(req.session.retur_products);
				req.session.retur_products = {};
				req.session.retur_products = target;
				req.session.save();
			}
			else {
				req.session.retur_products = pids;
				req.session.save();
			}
			helpers.__set_error_msg({info: 'Produk berhasil ditambahkan.'},req.sessionID);
			res.redirect('/retur/retur_list_products/' + input.type);
		}
		else {
			
		}
	}
	else {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/retur/retur_list_products/' + input.type);
	}
};

exports.list_products = async function(req, res) {
	var type = req.params.id;
    var rows = await models_retur.get_list_products(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('./tmp/retur_list_products',{data:rows,type:type,error_msg:errorMsg,layout:false});
};

exports.products = async function(req, res) {
	var id = req.params.id;
	var pids;
	
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	if (id > 0) {
		var rows = await models_retur.get_retur_product(req,1,id);
		if (rows)
			res.render('./tmp/retur_products',{tid:id,data:rows,type:2,error_msg:errorMsg,layout:false});
		else
			res.end();
	}
	else {
		if (typeof req.session.retur_products != 'undefined') {
			pids = req.session.retur_products;
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
		
		var rows = await models_retur.get_retur_product(req,2,pids);
		if (rows)
			res.render('./tmp/retur_products',{tid:0,data:rows,type:1,error_msg:errorMsg,layout:false});
		else
			res.end();
	}
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('retur_add',{error_msg:errorMsg});
};

exports.retur_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_retur.get_retur_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('retur_update',{id:id,data:rows[0],error_msg:errorMsg});
};

exports.retur_detail_approved = async function(req, res) {
	var id = req.params.id;
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    var rows = await models_retur.get_retur_detail_approved(req, 1, id);
    var drows = await models_retur.get_retur_detail_approved(req, 2, id);
	
	res.render('retur_detail',{id:id,products:drows,data:rows[0],error_msg:errorMsg});
};

exports.retur_add = function(req,res) {
	var input = req.body;
	if (!input.waktu || !input.customer) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/retur/retur_add');
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
		var ttotal = 0;
		var tammount = 0;
		
		req.getConnection(function (err, connection) {
			var str = input.waktu;
			var rres = str.replace(/\//g,'-');
			var waktu = new Date(rres).getTime() / 1000;
			var udate = helpers.__get_date('',2);
			var tqty = 0;
			
			if (typeof products != 'undefined') {
				Object.keys(products).map(function(objectKey, index) {
					var index = parseInt(objectKey);
					if (!isNaN(index)) {
						if (index > 0) {
							if (optype[index] == 1) {
								tammount += parseInt(products[index]) * parseFloat(ppricedozen[index]);
							}
							else if (optype[index] == 2) {
								tammount += parseInt(products[index]) * parseFloat(ppricekoli[index]);
							}
							else {
								if (parseInt(products[index]) > 2) {
									tammount += parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
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
				ttype : 2,
				tdate : waktu,
				tcid : input.customer,
				tqty : tqty,
				tammount : tammount,
				tdiscount : 0,
				ttotal : tammount,
				tdesc : input.desc,
				tcreatedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
				tstatus : input.status
			};
			
			var query = connection.query("INSERT INTO transaction_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/retur');
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
										tpricebase = parseInt(products[index]) * parseFloat(base_ppricedozen[index]);
									}
									else if (optype[index] == 2) {
										tprice = parseInt(products[index]) * parseFloat(ppricekoli[index]);
										tpricebase = parseInt(products[index]) * parseFloat(base_ppricekoli[index]);
									}
									else {
										if (products[index] > 2) {
											tprice = parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
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
					
					connection.query('SELECT COUNT(*) as totaltoday FROM transaction_tab WHERE ttype=2 AND tstatus!=2 AND FROM_UNIXTIME(tdate, "%Y-%m-%d")=DATE_FORMAT(NOW(),"%Y-%m-%d")',function(err,ckt) {
						var str = helpers.__get_date();	
						var dt = str.replace(/\//g, "");
						var tno = 'RO'+dt+helpers.__strpad('0000',(parseInt(ckt[0].totaltoday)+1),true);
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
					res.redirect('/retur');
				}
			});
		});
	}
};

exports.retur_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.waktu || !input.customer) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/retur/retur_update/' + id);
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
				var rres = str.replace(/\//g,'-');
				var waktu = new Date(rres).getTime() / 1000;
				var udate = helpers.__get_date('',2);
				var tqty = 0;
				
				if (typeof products != 'undefined') {
					Object.keys(products).map(function(objectKey, index) {
						var index = parseInt(objectKey);
						if (!isNaN(index)) {
							if (index > 0) {
								if (optype[index] == 1) {
									tammount += parseInt(products[index]) * parseFloat(ppricedozen[index]);
								}
								else if (optype[index] == 2) {
									tammount += parseInt(products[index]) * parseFloat(ppricekoli[index]);
								}
								else {
									if (parseInt(products[index]) > 2) {
										tammount += parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
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
					tdate : waktu,
					tcid : input.customer,
					tqty : tqty,
					tammount : tammount,
					tdiscount : 0,
					ttotal : tammount,
					tdesc : input.desc,
					tmodifiedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
					tapprovedby : rapproved,
					tstatus : status
				};
				connection.query("UPDATE transaction_tab set ? WHERE tid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/retur');
					}
					else {
						var rdata = [];
						var ttid = id;
						
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
											tpricebase = parseInt(products[index]) * parseFloat(base_ppricedozen[index]);
										}
										else if (optype[index] == 2) {
											tprice = parseInt(products[index]) * parseFloat(ppricekoli[index]);
											tpricebase = parseInt(products[index]) * parseFloat(base_ppricekoli[index]);
										}
										else {
											if (products[index] > 2) {
												tprice = parseInt(products[index]) * (parseFloat(ppricedozen[index]) / 12);
												tpricebase = parseInt(products[index]) * (parseFloat(base_ppricedozen[index]) / 12);
											}
											else {
												tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
												tpricebase = parseInt(products[index]) * parseFloat(base_ppricepcs[index]);
											}
										}
										
										var rdata = {
											tprice: tprice,
											tpricebase: tpricebase,
											tqty: parseInt(value),
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
													var idata = {
														istockreturn : (parseInt(inv[0].istockreturn) + parseInt(value))
													};
													
													connection.query("UPDATE inventory_tab SET ? WHERE iid = ? ",[idata,inv[0].iid], function(err, rows) {
														
													});
												}
											});
										}
									}
								}
							});
						}
						
						if (app == 1) {
							helpers.__set_error_msg({info : 'Data berhasil diapproved.'},req.sessionID);
							res.redirect('/retur');
						}
						else {
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/retur');
						}
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/retur');
	}
};

exports.retur_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			tstatus : 2
		};
		
		connection.query("UPDATE transaction_tab SET ? WHERE tid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/retur');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/retur');
			}
		});
	});
};
