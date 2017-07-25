exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM vendor_tab WHERE (vstatus=1 OR vstatus=0)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('vendor',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_ajax = function(req, res) {
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT vid as id,vname as value FROM vendor_tab WHERE (vstatus=1 OR vstatus=0)',function(err,rows) {
			if (err) console.log("Error Selecting : %s ",err );
				res.send({data:rows});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('vendor_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.vendor_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM vendor_tab WHERE ctype=1 AND vid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('vendor_update',{id:id,data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.vendor_add = function(req,res) {
	var input = req.body;
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/vendor/vendor_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				vname : input.name,
				vaddr : input.vaddr,
				vcpname : input.cpname,
				vphone : input.phone,
				vstatus : input.status
			};

			var query = connection.query("INSERT INTO vendor_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/vendor');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/vendor');
				}
			});
		});
	}
};

exports.vendor_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/vendor/vendor_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					vname : input.name,
					vaddr : input.vaddr,
					vcpname : input.cpname,
					vphone : input.phone,
					vstatus : input.status
				};

				connection.query("UPDATE vendor_tab SET ? WHERE vid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/vendor');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/vendor');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/vendor');
	}
};

exports.vendor_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			vstatus : 2
		};
		
		connection.query("UPDATE vendor_tab SET ? WHERE vid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/vendor');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/vendor');
			}
		});
	});
};
