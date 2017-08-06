exports.main = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('login',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID),layout: false});
	});
};

exports.logout = function(req,res) {
	req.session.login = {};
	req.session.destroy();
	res.redirect('/login');
};

exports.login = function(req,res) {
	var input = req.body;
	if (!input.uemail || !input.upass) {
		helpers.__set_error_msg({error: 'Email dan Password harus di isi !!!'},req.sessionID);
		res.redirect('/login');
	}
	else {
		sauth = req.session;
		
		req.getConnection(function (err, connection) {
			connection.query("SELECT * FROM users_tab WHERE uemail='"+input.uemail+"' AND upass='"+helpers.__hash_password(input.upass)+"' AND ustatus=1",function(err, rows) {
				if (rows[0]) {
						connection.query("SELECT a.uname as perm,a.uurl as url,b.uaccess as access from users_permission_tab a JOIN users_access_tab b ON a.uid=b.upid WHERE b.ugid="+rows[0].ugid,function(err, perms) {
						var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
						var member_since = new Date(rows[0].ucreated * 1000);
						member_since = monthNames[member_since.getMonth()] + ' ' + member_since.getFullYear();
						
						sauth.login = {uid: rows[0].uid, ucreated:member_since, ugroup: rows[0].ugid, uemail: rows[0].uemail, perms: perms};
						
						if (err) {
							console.log("Error Selecting : %s ",err );
						}
						
						var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
						var data = {
							ulastlogin : ip+'*'+helpers.__get_date_now()
						};
						
						connection.query("UPDATE users_tab set ? WHERE uid = ? ",[data,rows[0].uid], function(err, rows) {
							if (err) {
								console.log("Error Selecting : %s ",err );
							}
						});
						
						res.redirect('/');
					});
				}
				else {
					helpers.__set_error_msg({error: 'Username dan password tidak sesuai !!!'},req.sessionID);
					res.redirect('/login');	
				}
			});
		});
	}
};
