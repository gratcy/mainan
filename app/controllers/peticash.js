import models_peticash from '../models/models_peticash';

exports.list = async function(req, res) {
	var d = new Date();
	var month = parseInt(d.getMonth()) + 1;
	var year = d.getFullYear();
	
    var rows = await models_peticash.get_peticash(req, month, year);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('peticash',{monthyear:month+','+year,execute:helpers.__get_roles('peticashExecute'),data:rows,error_msg:errorMsg});

};

exports.list_post = async function(req, res) {
	var input = req.body;
	var monthyear = input.monthyear;
	var my = monthyear.split(',');
	var month = parseInt(my[0]);
	var year = my[1];
	
    var rows = await models_peticash.get_peticash(req, month, year);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);

	res.render('peticash',{monthyear:monthyear,execute:helpers.__get_roles('peticashExecute'),data:rows,error_msg:errorMsg});
};

exports.add = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('peticash_add',{error_msg:errorMsg});
};

exports.peticash_add = function(req,res) {
	var input = req.body;
	if (!input.nominal || input.nominal == 0) {
		helpers.__set_error_msg({error: 'Nominal harus di isi !!!'},req.sessionID);
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
