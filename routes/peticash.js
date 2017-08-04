exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var d = new Date();
			var month = parseInt(d.getMonth()) + 1;
			var year = d.getFullYear();
			
			var query = connection.query('SELECT * FROM peticash_tab WHERE pstatus=1 AND MONTH(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+month+' and YEAR(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+year+' ORDER BY pid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('peticash',{monthyear:month+','+year,execute:helpers.__get_roles('peticashExecute'),data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.list_post = function(req, res) {
	var input = req.body;
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var monthyear = input.monthyear;
			var my = monthyear.split(',');
			var month = parseInt(my[0]);
			var year = my[1];
			
			var query = connection.query('SELECT * FROM peticash_tab WHERE pstatus=1 AND MONTH(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+month+' and YEAR(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+year+' ORDER BY pid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('peticash',{monthyear:monthyear,execute:helpers.__get_roles('peticashExecute'),data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

exports.add = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		res.render('peticash_add',{error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
	});
};

exports.peticash_add = function(req,res) {
	var input = req.body;
	if (!input.nominal) {
		helpers.__set_error_msg({error: 'Data yang anda masukkan tidak lengkap !!!'},req.sessionID);
		res.redirect('/peticash/peticash_add');
	}
	else {
		var nominal = input.nominal;
			nominal = nominal.replace(/(\,|\.)/g, "");
			nominal = parseInt(nominal);
			
		req.getConnection(function (err, connection) {
			var d = new Date();
			var month = parseInt(d.getMonth()) + 1;
			var year = d.getFullYear();
			connection.query("SELECT psaldo FROM `peticash_tab` where MONTH(FROM_UNIXTIME( pdate,  '%Y-%m-%d' ))="+month+" and YEAR(FROM_UNIXTIME( pdate,  '%Y-%m-%d' ))="+year+" order by pid desc LIMIT 0,1",function(err, saldo) {
				var rsaldo = 0;
				if (saldo) rsaldo = parseInt(saldo[0].psaldo);
				
				if (input.type == 1) saldo = rsaldo + nominal;
				else saldo = rsaldo - nominal;
				
				var data = {
					pdate : helpers.__get_date_now(),
					ptype : input.type,
					pdesc : input.desc,
					pnominal : nominal,
					psaldo : saldo,
					pstatus : 1
				};
				
				var query = connection.query("INSERT INTO peticash_tab SET ? ",data, function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
						res.redirect('/peticash');
					}
					else {
						helpers.__set_error_msg({info : 'Data berhasil ditambahkan.'},req.sessionID);
						res.redirect('/peticash');
					}
				});
			});
		});
	}
};
