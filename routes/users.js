import models_users from '../models/models_users';

exports.list = async function(req, res) {
    var rows = await models_users.get_users(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('users',{data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_users.get_users_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('users_add',{error_msg:errorMsg});
};

exports.users_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_users.get_users_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('users_update',{data:rows[0],error_msg:errorMsg});
};

exports.users_add = function(req,res) {
	var input = req.body;
	if (!input.uemail || !input.group || !input.newpass || !input.confpass || !input.unick) {
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
				unick : input.unick,
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
		if (!input.uemail || !input.group || !input.unick) {
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
						unick : input.unick,
						upass : helpers.__hash_password(input.confpass),
						ustatus : input.status
					};
				}
				else {
					var data = {
						ugid : input.group,
						uemail : input.uemail,
						unick : input.unick,
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
