exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.vname FROM receiving_tab a LEFT JOIN vendor_tab b ON a.rvid=b.vid WHERE (a.rstatus=1 OR a.rstatus=0)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('receiving',{execute:helpers.__get_roles('CategoriesExecute'),data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
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
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/receiving/receiving_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				rdate : input.waktu,
				rvendor : input.vendor,
				rdocno : input.docno,
				rdesc : input.desc,
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
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/receiving/receiving_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					rdate : input.waktu,
					rvendor : input.vendor,
					rdocno : input.docno,
					rdesc : input.desc,
					rstatus : input.status
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
