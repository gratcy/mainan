exports.list = function(req, res) {
	req.session.receiving_products = {};
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.vname FROM receiving_tab a LEFT JOIN vendor_tab b ON a.rvendor=b.vid WHERE (a.rstatus=1 OR a.rstatus=0 OR a.rstatus=3)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('receiving',{execute:helpers.__get_roles('CategoriesExecute'),data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.products_delete = function(req, res) {
	var input = req.body;
	if (input.type == 1) {
		var pids = req.session.receiving_products;
		var tmpPids = [];
		for(var i=0;i<pids.length;++i) {
			var index = parseInt(pids[i]);
			if (!isNaN(index)) {
				if (index > 0 && input.pid != index) {
					tmpPids.push(index);
				}
			}
		}
		req.session.receiving_products = {};
		req.session.receiving_products = tmpPids;
		res.send('-1');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				rstatus : 2
			};
			
			connection.query("UPDATE receiving_item_tab SET ? WHERE riid = ? AND rpid = ? ",[data,input.rid,input.pid], function(err, rows) {
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
			if (typeof req.session.receiving_products != 'undefined') {
				var target = pids.concat(req.session.receiving_products);
				req.session.receiving_products = {};
				req.session.receiving_products = target;
				req.session.save();
			}
			else {
				req.session.receiving_products = pids;
				req.session.save();
			}
			helpers.__set_error_msg({info: 'Produk berhasil ditambahkan.'},req.sessionID);
			res.redirect('/receiving/receiving_list_products/' + input.type);
		}
		else {
			
		}
	}
	else {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/receiving/receiving_list_products/' + input.type);
	}
};

exports.list_products = function(req, res) {
	var type = req.params.id;
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname,d.istock FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid JOIN inventory_tab d ON a.pid=d.ipid WHERE b.ctype=1 AND a.pstatus=1 ORDER BY a.pid DESC',function(err,rows) {
				res.render('./tmp/receiving_list_products',{data:rows,type:type,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
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
				var query = connection.query('SELECT a.rqty,b.*,c.cname FROM receiving_item_tab a INNER JOIN products_tab b ON a.rpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.riid='+id+' AND a.rstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC',function(err,rows) {
					if (rows)
						res.render('./tmp/receiving_products',{rid:id,data:rows,type:2,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
					else
						res.end();
				});
			});
		}
		else {
			if (typeof req.session.receiving_products != 'undefined') {
				pids = req.session.receiving_products;
				var rpids = '';
				for(var i=0;i<pids.length;++i) {
					var index = parseInt(pids[i]);
					if (!isNaN(index)) {
						if (index > 0) {
							rpids += index + ',';
						}
					}
				}
				if (pids)
					pids = rpids.slice(0,-1);
				else
					pids = 0;
			}
			else {
				pids = 0;
			}
			console.log(pids);
			req.getConnection(function(err,connection){
				var query = connection.query('SELECT a.*,b.cname FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid WHERE a.pstatus=1 AND a.pid IN ('+pids+') ORDER BY a.pid DESC',function(err,rows) {
					if (rows)
						res.render('./tmp/receiving_products',{rid:0,data:rows,type:1,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
					else
						res.end();
				});
			});
		}
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('receiving_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.receiving_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM receiving_tab WHERE rid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('receiving_update',{id:id,data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.receiving_add = function(req,res) {
	var input = req.body;
	if (!input.waktu || !input.vendor || !input.docno) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/receiving/receiving_add');
	}
	else {
		var products = input.products;
		req.getConnection(function (err, connection) {
			var str = input.waktu;
			var rres = str.split('/');
			var waktu = new Date(rres[2]+"-"+rres[1]+"-"+rres[0]).getTime() / 1000;
			var udate = helpers.__get_date('',2);
			var data = {
				rdate : waktu,
				rvendor : input.vendor,
				rdocno : input.docno,
				rdesc : input.desc,
				rcreatedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
				rstatus : input.status
			};

			var query = connection.query("INSERT INTO receiving_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/receiving');
				}
				else {
					var rdata = [];
					var riid = rows.insertId;
					
					Object.keys(products).map(function(objectKey, index) {
						var index = parseInt(objectKey);
						if (!isNaN(index)) {
							if (index > 0) {
								var value = products[index];
								rdata.push([riid,index,parseInt(value),1]);
							}
						}
					});
					
					var query = connection.query("INSERT INTO receiving_item_tab (riid,rpid,rqty,rstatus) VALUES ?",[rdata], function(err, rows) {
						if (err) {
							console.log("Error Selecting : %s ",err );
						}
					});
						
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/receiving');
				}
			});
		});
	}
};

exports.receiving_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.waktu || !input.vendor || !input.docno) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/receiving/receiving_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var app = input.app;
				var str = input.waktu;
				var rres = str.split('/');
				var waktu = new Date(rres[2]+"-"+rres[1]+"-"+rres[0]).getTime() / 1000;
				
				var udate = helpers.__get_date('',2);
				var status = input.status;
				var rapproved = '';
				
				if (app == 1) {
					rapproved = JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate});
					status = 3;
				}
				
				var data = {
					rdate : waktu,
					rvendor : input.vendor,
					rdocno : input.docno,
					rdesc : input.desc,
					rmodifiedby : JSON.stringify({uid: sauth.uid, uemail: sauth.uemail, udate: udate}),
					rapprovedby : rapproved,
					rstatus : status
				};

				connection.query("UPDATE receiving_tab set ? WHERE rid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/receiving');
					}
					else {
						var products = input.products;
						var rdata = [];
						var riid = id;
						
						Object.keys(products).map(function(objectKey, index) {
							var index = parseInt(objectKey);
							if (!isNaN(index)) {
								if (index > 0) {
									var value = products[index];
									var rdata = {
										rqty : value
									};
									connection.query("UPDATE receiving_item_tab SET ? WHERE riid = ? AND rpid = ? ",[rdata,id,index], function(err, rows) {
										
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
												
												connection.query("UPDATE inventory_tab SET ? WHERE iid = ? ",[idata,inv[0].iid], function(err, rows) {
													
												});
											}
										});
									}
								}
							}
						});
					
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/receiving');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/receiving');
	}
};

exports.receiving_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			rstatus : 2
		};
		
		connection.query("UPDATE receiving_tab SET ? WHERE rid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/receiving');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/receiving');
			}
		});
	});
};
