import models_categories from '../models/models_categories';

exports.list = async function(req, res) {
    var rows = await models_categories.get_categories(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('categories',{execute:helpers.__get_roles('CategoriesExecute'),data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_categories.get_categories_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('categories_add',{error_msg:errorMsg});
};

exports.categories_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_categories.get_categories_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);

	res.render('categories_update',{data:rows[0],error_msg:errorMsg});
};

exports.categories_add = function(req,res) {
	var input = req.body;
	if (!input.name) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/categories/categories_add');
	}
	else {
		req.getConnection(function (err, connection) {
			var data = {
				ctype : 1,
				cname : input.name,
				cdesc : input.desc,
				cstatus : input.status
			};

			var query = connection.query("INSERT INTO categories_tab SET ? ",data, function(err, rows) {
				if (err) {
					console.log("Error Selecting : %s ",err );
					helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
					res.redirect('/categories');
				}
				else {
					helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
					res.redirect('/categories');
				}
			});
		});
	}
};

exports.categories_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (!input.name) {
			helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
			res.redirect('/categories/categories_update/' + id);
		}
		else {
			req.getConnection(function (err, connection) {
				var data = {
					ctype : 1,
					cname : input.name,
					cdesc : input.desc,
					cstatus : input.status
				};

				connection.query("UPDATE categories_tab set ? WHERE cid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/categories');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
						res.redirect('/categories');
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/categories');
	}
};

exports.categories_delete = function(req,res){
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
		var data = {
			cstatus : 2
		};
		
		connection.query("UPDATE categories_tab SET ? WHERE cid = ? ",[data,id], function(err, rows) {
			if (err) {
				console.log("Error Selecting : %s ",err );
				helpers.__set_error_msg({error : 'Gagal hapus data !!!'},req.sessionID);
				res.redirect('/categories');
			}
			else {
				helpers.__set_error_msg({info : 'Data berhasil dihapus.'},req.sessionID);
				res.redirect('/categories');
			}
		});
	});
};
