exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.pname FROM city_tab a JOIN province_tab b ON a.cpid=b.pid WHERE (a.cstatus=1 OR a.cstatus=0)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('city',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_ajax = function(req, res) {
	var input = req.query;
	var id = input.province_id;
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT cid as id,cname as value FROM city_tab WHERE cpid='+id+' AND (cstatus=1 OR cstatus=0)',function(err,rows) {
			if (err) console.log("Error Selecting : %s ",err );
				res.send({data:rows});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('city_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.city_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM city_tab WHERE cid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('city_update',{data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.city_add = function(req,res) {
	var input = req.body;
	if (!input.name || !input.prov) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/city/city_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				cpid : input.prov,
				cname : input.name,
				cstatus : input.status
			};

			var query = connection.query("INSERT INTO city_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/city');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/city');
				}
			});
		});
	}
};

exports.city_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name || !input.prov) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/city/city_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					cpid : input.prov,
					cname : input.name,
					cstatus : input.status
				};

				connection.query("UPDATE city_tab set ? WHERE cid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/city');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/city');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/city');
	}
};

exports.city_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			cstatus : 2
		};
		
		connection.query("UPDATE city_tab SET ? WHERE cid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/city');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/city');
			}
		});
	});
};
