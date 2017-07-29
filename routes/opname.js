exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.pname FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid ORDER BY a.ipid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('opname',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.opname_detail = function(req, res) {
	var id = req.params.id;
	
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.pname,b.pdesc FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (a.istatus=1 OR a.istatus=0) AND a.ipid= ?',[id],function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('opname_update',{data:rows[0],id:id,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.opname_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (input.adjustplus && input.adjustmin) {
			helpers.__set_error_msg({error: 'Adjust min dan plus salah satu harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else if (!input.adjustplus && !input.adjustmin) {
			helpers.__set_error_msg({error: 'Adjust min dan plus salah satu harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else if (!input.desc) {
			helpers.__set_error_msg({error: 'Keterangan harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else {
			var sfinal = 0;
			var adjustplus = input.adjustplus ? parseInt(input.adjustplus) : 0;
			var adjustmin = input.adjustmin ? parseInt(input.adjustmin) : 0;
			var sfinal2 = input.sfinal2 ? parseInt(input.sfinal2) : 0;
			
			if (adjustplus) sfinal = sfinal2 + adjustplus;
			else sfinal = sfinal2 - adjustmin;
			
			req.getConnection(function (err, connection) {
				var data = {
					istock : sfinal
				};

				connection.query("UPDATE inventory_tab set ? WHERE ipid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/opname');
					}
					else {
						var rdata = {
							oidid : id,
							odate : helpers.__get_date_now(),
							ostockbegining : input.sbegin2,
							ostockin : input.sin2,
							ostockout : input.sout2,
							ostock : input.sfinal2,
							oadjustmin : adjustmin,
							oadjustplus : adjustplus,
							odesc : input.desc,
							ostatus : 1
						};
						console.log(rdata);
						var rquery = connection.query("INSERT INTO opname_tab SET ? ",rdata, function(err, rows) {
							if (err) {
								console.log("Error Selecting : %s ",err );
							}
							
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/opname');
						});
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/opname');
	}
};
