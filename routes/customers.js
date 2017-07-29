exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname as city,c.pname as province FROM customers_tab a LEFT JOIN city_tab b ON a.ccity=b.cid LEFT JOIN province_tab c ON a.cprovince=c.pid WHERE (a.cstatus=1 OR a.cstatus=0) ORDER BY a.cid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('customers',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_ajax = function(req, res) {
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT cid as id,cname as value FROM customers_tab WHERE (cstatus=1 OR cstatus=0)',function(err,rows) {
			if (err) console.log("Error Selecting : %s ",err );
				res.send({data:rows});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('customers_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.quick_add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('./tmp/customers_quick_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
	});
};

exports.customers_quick_add = function(req,res) {
	var input = req.body;
	
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/customers/customer_quick_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var deposit = input.deposit;
				deposit = deposit.replace(/(\,|\.)/g, "");
			var data = {
				ctype : input.ctype,
				cname : input.name,
				caddr : input.addr,
				cprovince : input.province,
				ccity : input.city,
				cemail : input.email,
				cphone : input.phone[0]+'*'+input.phone[1],
				cdeposit : deposit,
				cstatus : input.status
			};

			var query = connection.query("INSERT INTO customers_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/customers/customer_quick_add');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/customers/customer_quick_add');
				}
			});
		});
	}
};

exports.customers_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM customers_tab WHERE cid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('customers_update',{data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.customers_add = function(req,res) {
	var input = req.body;
	
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/customers/customers_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var deposit = input.deposit;
				deposit = deposit.replace(/(\,|\.)/g, "");
			var data = {
				ctype : input.ctype,
				cname : input.name,
				caddr : input.addr,
				cprovince : input.province,
				ccity : input.city,
				cemail : input.email,
				cphone : input.phone[0]+'*'+input.phone[1],
				cdeposit : deposit,
				cstatus : input.status
			};
			
			var query = connection.query("INSERT INTO customers_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/customers');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/customers');
				}
			});
		});
	}
};

exports.customers_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/customers/customers_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var deposit = input.deposit;
					deposit = deposit.replace(/(\,|\.)/g, "");
				var data = {
					ctype : input.ctype,
					cname : input.name,
					caddr : input.addr,
					cprovince : input.province,
					ccity : input.city,
					cemail : input.email,
					cphone : input.phone[0]+'*'+input.phone[1],
					cdeposit : deposit,
					cstatus : input.status
				};

				connection.query("UPDATE customers_tab set ? WHERE cid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/customers');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/customers');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/customers');
	}
};

exports.customers_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			cstatus : 2
		};
		
		connection.query("UPDATE customers_tab SET ? WHERE cid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/customers');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/customers');
			}
		});
	});
};
