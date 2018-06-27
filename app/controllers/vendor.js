import models_vendor from '../models/models_vendor';

exports.list = async function(req, res) {
    var rows = await models_vendor.get_vendor(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('vendor',{data:rows,error_msg:errorMsg});
};

exports.list_ajax = async function(req, res) {
	var rows = await models_vendor.get_vendor_select(req);
	
	res.send({data:rows});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('vendor_add',{error_msg:errorMsg});
};

exports.vendor_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_vendor.get_vendor_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('vendor_update',{id:id,data:rows[0],error_msg:errorMsg});
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
				vaddr : input.addr,
				vcpname : input.cpname,
				vphone : input.phone[0]+'*'+input.phone[1],
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
					vaddr : input.addr,
					vcpname : input.cpname,
					vphone : input.phone[0]+'*'+input.phone[1],
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
