import models_user_group from '../models/models_user_group';

exports.list = async function(req, res) {
    var rows = await models_user_group.get_user_group(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);

	res.render('users_group',{data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_user_group.get_group_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	var perms = await models_user_group.get_permission(req);
    
	res.render('users_group_add',{perms:perms,error_msg:errorMsg});
};

exports.users_group_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_user_group.get_group_detail(req, id);
    var perms = await models_user_group.get_group_permission(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('users_group_update',{data:rows[0],perms:perms,error_msg:errorMsg});
};

exports.users_group_add = function(req,res) {
	var input = req.body;
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/users_group/users_group_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				uname : input.name,
				udesc : input.desc,
				ustatus : input.status
			};

			var query = connection.query("INSERT INTO users_groups_tab SET ? ",data, function(err, rows) {
				gid = rows.insertId;
				
				var perm = input.perm;
				Object.keys(perm).map(function(objectKey, index) {
					var value = perm[objectKey];
					if (value == 1 || value == 0) {
						var rdata = {
							ugid : gid,
							upid : objectKey,
							uaccess : value
						};
						query = connection.query("INSERT INTO users_access_tab SET ? ",rdata, function(err, rows) {
							if (err) {
								console.log("Error Selecting : %s ",err );
							}
						});
					}
				});
				
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/users_group');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/users_group');
				}
			});
		});
	}
};

exports.users_group_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/users_group/users_group_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					uname : input.name,
					udesc : input.desc,
					ustatus : input.status
				};

				connection.query("UPDATE users_groups_tab set ? WHERE uid = ? ",[data,id], function(err, rows) {
					var perm = input.perm;
					Object.keys(perm).map(function(objectKey, index) {
						var value = perm[objectKey];
						if (value == 1 || value == 0) {
							var rdata = {
								uaccess : value
							};
							connection.query("UPDATE users_access_tab SET ? WHERE ugid = ? AND upid = ? ",[rdata,id,objectKey], function(err, rows) {
								if (err) {
									console.log("Error Selecting : %s ",err );
								}
							});
						}
					});
				
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/users_group');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/users_group');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/users_group');
	}
};

exports.users_group_delete = function(req,res){
	var id = req.params.id;
	
	if (id == 1) {
		helpers.__set_error_msg({info : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/users_group');
		return;
	}
	
	req.getConnection(function (err, connection) {
		var data = {
			ustatus : 2
		};
		
		connection.query("UPDATE users_groups_tab SET ? WHERE uid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/users_group');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/users_group');
			}
		});
	});
};
