exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM province_tab WHERE (pstatus=1 OR pstatus=0) ORDER BY pid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('province',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_ajax = function(req, res) {
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT pid as id,pname as value FROM province_tab WHERE (pstatus=1 OR pstatus=0)',function(err,rows) {
			if (err) console.log("Error Selecting : %s ",err );
				res.send({data:rows});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('province_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.province_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM province_tab WHERE pid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('province_update',{data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.province_add = function(req,res) {
	var input = req.body;
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/province/province_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				pname : input.name,
				pstatus : input.status
			};

			var query = connection.query("INSERT INTO province_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/province');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/province');
				}
			});
		});
	}
};

exports.province_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/province/province_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					pname : input.name,
					pstatus : input.status
				};

				connection.query("UPDATE province_tab set ? WHERE pid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/province');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/province');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/province');
	}
};

exports.province_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			pstatus : 2
		};
		
		connection.query("UPDATE province_tab SET ? WHERE pid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/province');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/province');
			}
		});
	});
};
