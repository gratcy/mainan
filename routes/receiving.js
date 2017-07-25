exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.vname FROM receiving_tab a LEFT JOIN vendor_tab b ON a.rvendor=b.vid WHERE (a.rstatus=1 OR a.rstatus=0 OR a.rstatus=3)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('receiving',{execute:helpers.__get_roles('CategoriesExecute'),data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_products = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname,d.istock FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid JOIN inventory_tab d ON a.pid=d.ipid WHERE b.ctype=1 AND a.pstatus=1 ORDER BY a.pid DESC',function(err,rows) {
				res.render('./tmp/receiving_list_products',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
			});
		});
	});
};

exports.products = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.cname FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid WHERE a.pstatus=1 AND a.pid IN (0) ORDER BY a.pid DESC',function(err,rows) {
				if (rows[0])
				res.render('./tmp/receiving_products',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout:false});
				else
				res.end();
			});
		});
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
				var str = input.waktu;
				var rres = str.split('/');
				var waktu = new Date(rres[2]+"-"+rres[1]+"-"+rres[0]).getTime() / 1000;
				
				var udate = helpers.__get_date('',2);
				var status = input.status;
				var rapproved = '';
				if (input.app == 1) {
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
