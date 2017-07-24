exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.uname as gname FROM users_tab a JOIN users_groups_tab b ON a.ugid=b.uid WHERE (a.ustatus=1 OR a.ustatus=0)',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('users',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('users_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.users_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT * FROM users_tab WHERE uid = ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('users_update',{data:rows[0],error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.users_add = function(req,res) {
	var input = req.body;
	if (!input.uemail || !input.group || !input.newpass || !input.confpass) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/users/users_add');
	}
	else if (input.confpass !== input.newpass) {
		helpers.__set_error_msg({error: 'Password dan password konfirmasi tidak sesuai !!!'},req.sessionID);
		res.redirect('/users/users_add');
	}
	else if (!helpers.__validate_email(input.uemail)) {
		helpers.__set_error_msg({error: 'Penulisan email salah !!!'},req.sessionID);
		res.redirect('/users/users_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				ugid : input.group,
				uemail : input.uemail,
				upass : helpers.__hash_password(input.confpass),
				ustatus : input.status
			};

			var query = connection.query("INSERT INTO users_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/users');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/users');
				}
			});
		});
	}
};

exports.users_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.uemail || !input.group) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/users/users_update/' + id);
		}
		else if (!helpers.__validate_email(input.uemail)) {
			helpers.__set_error_msg({error: 'Penulisan email salah !!!'},req.sessionID);
			res.redirect('/users/users_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				if (input.confpass || input.newpass) {
					if (input.confpass !== input.newpass) {
						helpers.__set_error_msg({error: 'Password dan password konfirmasi tidak sesuai !!!'},req.sessionID);
						res.redirect('/users/users_update/' + id);
						return;
					}
					
					var data = {
						ugid : input.group,
						uemail : input.uemail,
						upass : helpers.__hash_password(input.confpass),
						ustatus : input.status
					};
				}
				else {
					var data = {
						ugid : input.group,
						uemail : input.uemail,
						ustatus : input.status
					};
				}
				
				connection.query("UPDATE users_tab set ? WHERE uid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/users');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/users');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/users');
	}
};

exports.users_delete = function(req,res){
	var id = req.params.id;
	
	if (id == 1) {
		helpers.__set_error_msg({info : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/users');
		return;
	}
	
	req.getConnection(function (err, connection) {
		var data = {
			ustatus : 2
		};
		
		connection.query("UPDATE users_tab SET ? WHERE uid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/users');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/users');
			}
		});
	});
};
