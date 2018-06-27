import models_province from '../models/models_province';

exports.list = async function(req, res) {
    var rows = await models_province.get_province(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('province',{data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_province.get_province_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('province_add',{error_msg:errorMsg});
};

exports.province_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_province.get_province_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('province_update',{data:rows[0],error_msg:errorMsg});
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
