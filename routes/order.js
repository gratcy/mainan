exports.list = function(req, res) {
	req.session.order_products = {};
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) ORDER BY a.tid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('order',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
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
					res.send('1');
				}
			});
		});
	}
};

exports.products_add = function(req, res) {
	var input = req.body;
	if (input.pid[0]) {
		if (input.type == 1) {
			var pids = input.pid;
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
			helpers.__set_error_msg({info: 'Produk berhasil ditambahkan.'},req.sessionID);
			res.redirect('/order/order_list_products/' + input.type);
		}
		else {
			
		}
	}
	else {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/order/order_list_products/' + input.type);
	}
};

exports.list_products = function(req, res) {
	var type = req.params.id;
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname,d.istock FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid JOIN inventory_tab d ON a.pid=d.ipid WHERE b.ctype=1 AND a.pstatus=1 ORDER BY a.pid DESC',function(err,rows) {
				res.render('./tmp/order_list_products',{data:rows,type:type,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
			});
		});
	});
};

exports.products = function(req, res) {
	var id = req.params.id;
	var pids;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		if (id > 0) {
			req.getConnection(function(err,connection){
				var query = connection.query('SELECT a.tqty,a.ttype,b.*,c.cname FROM transaction_detail_tab a INNER JOIN products_tab b ON a.tpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.ttid='+id+' AND a.tstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC',function(err,rows) {
					if (rows)
						res.render('./tmp/order_products',{tid:id,data:rows,type:2,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
					else
						res.end();
				});
			});
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
				if (pids)
					pids = tpids.slice(0,-1);
				else
					pids = 0;
			}
			else {
				pids = 0;
			}
			console.log(pids);
			req.getConnection(function(err,connection){
				var query = connection.query('SELECT a.*,b.cname,0 as ttype FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid WHERE a.pstatus=1 AND a.pid IN ('+pids+') ORDER BY a.pid DESC',function(err,rows) {
					if (rows)
						res.render('./tmp/order_products',{tid:0,data:rows,type:1,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
					else
						res.end();
				});
			});
		}
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('order_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.order_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM transaction_tab WHERE tid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('order_update',{id:id,data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.order_detail_approved = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM transaction_tab WHERE tid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				
				connection.query('SELECT a.tqty,a.tprice,a.tpricebase,a.ttype,b.pname,b.pdesc,c.cname FROM transaction_detail_tab a INNER JOIN products_tab b ON a.tpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.ttid='+id+' AND a.tstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC',function(err,drows) {
					if (err) console.log("Error Selecting : %s ",err );
					else res.render('order_detail',{id:id,products:drows,data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
				});
			});
		});
	});
};

exports.order_add = function(req,res) {
	var input = req.body;
	if (!input.waktu || !input.customer) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/order/order_add');
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
		var tdisc = parseFloat(input.disc.replace(/(\,|\.)/g, ""));
		var ttotal = 0;
		var tammount = 0;
		
		req.getConnection(function (err, connection) {
			var str = input.waktu;
			var rres = str.split('/');
			var waktu = new Date(rres[2]+"-"+rres[1]+"-"+rres[0]).getTime() / 1000;
			var udate = helpers.__get_date('',2);
			var tqty = 0;
			
			Object.keys(products).map(function(objectKey, index) {
				var index = parseInt(objectKey);
				if (!isNaN(index)) {
					if (index > 0) {
						if (optype[index] == 1)
							tammount += parseInt(products[index]) * parseFloat(ppricedozen[index]);
						else if (optype[index] == 2)
							tammount += parseInt(products[index]) * parseFloat(ppricekoli[index]);
						else
							tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
						
						tqty += parseInt(products[index]);
					}
				}
			});
			
			var data = {
				ttype : 1,
				tdate : waktu,
				tcid : input.customer,
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
									tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
									tpricebase = parseInt(products[index]) * parseFloat(base_ppricepcs[index]);
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
					res.redirect('/order');
				}
			});
		});
	}
};

exports.order_update = function(req,res) {
	var input = req.body;
	var id = input.id;
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
				var rres = str.split('/');
				var waktu = new Date(rres[2]+"-"+rres[1]+"-"+rres[0]).getTime() / 1000;
				var udate = helpers.__get_date('',2);
				var tqty = 0;
				
				Object.keys(products).map(function(objectKey, index) {
					var index = parseInt(objectKey);
					if (!isNaN(index)) {
						if (index > 0) {
							if (optype[index] == 1)
								tammount += parseInt(products[index]) * parseFloat(ppricedozen[index]);
							else if (optype[index] == 2)
								tammount += parseInt(products[index]) * parseFloat(ppricekoli[index]);
							else
								tammount += parseInt(products[index]) * parseFloat(ppricepcs[index]);
							
							tqty += parseInt(products[index]);
						}
					}
				});
				
				var data = {
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
										tprice = parseInt(products[index]) * parseFloat(ppricepcs[index]);
										tpricebase = parseInt(products[index]) * parseFloat(base_ppricepcs[index]);
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
													istockin : (parseInt(inv[0].istockin) + parseInt(value)),
													istock : (parseInt(inv[0].istock) + parseInt(value))
												};
												
												//~ connection.query("UPDATE inventory_tab SET ? WHERE iid = ? ",[idata,inv[0].iid], function(err, rows) {
													
												//~ });
											}
										});
									}
								}
							}
						});
						
						if (app == 1) {
							helpers.__set_error_msg({info : 'Data berhasil diapproved.'},req.sessionID);
							res.redirect('/order');
						}
						else {
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/order');
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
