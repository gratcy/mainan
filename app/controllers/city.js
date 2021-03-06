import models_city from '../models/models_city';

exports.list = async function(req, res) {
    var rows = await models_city.get_city(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('city',{data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var input = req.query;
	var id = input.province_id;
	var rows = await models_city.get_city_select(req, id);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('city_add',{error_msg:errorMsg});
};

exports.city_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_city.get_city_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('city_update',{data:rows[0],error_msg:errorMsg});
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
