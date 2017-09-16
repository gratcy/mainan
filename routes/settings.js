import models_users from '../models/models_users';

exports.settings = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    var rows = await models_users.get_users_detail(req, sauth.uid);
	res.render('settings',{data:rows[0],error_msg:errorMsg});
};

exports.settings_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.uemail || !input.unick) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/settings');
		}
		else {
			req.getConnection(function (err, connection) {
				if (!input.confpass || !input.newpass) {
					var data = {
						unick : input.unick
					};

					connection.query("UPDATE users_tab set ? WHERE uid = ? ",[data,id], function(err, rows) {
						if (err) {
							console.log("Error Selecting : %s ",err );
							helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
							res.redirect('/settings');
						}
						else {
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/settings');
						}
					});
				}
				else {
					if (input.confpass !== input.newpass) {
						helpers.__set_error_msg({error: 'Password dan password konfirmasi tidak sesuai !!!'},req.sessionID);
						res.redirect('/settings');
						return;
					}
						
					connection.query("SELECT * FROM users_tab WHERE uid = ? ",[id], function(err, rck) {
						if (helpers.__hash_password(input.oldpass) != rck[0].upass) {
							helpers.__set_error_msg({error: 'Password lama tidak sesuai !!!'},req.sessionID);
							res.redirect('/settings');
						}
						else {
							var data = {
								unick : input.unick,
								upass : helpers.__hash_password(input.confpass)
							};

							connection.query("UPDATE users_tab set ? WHERE uid = ? ",[data,id], function(err, rows) {
								if (err) {
									console.log("Error Selecting : %s ",err );
									helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
									res.redirect('/settings');
								}
								else {
									helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
									res.redirect('/settings');
								}
							});
						}
					});
				}
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/settings');
	}
};
