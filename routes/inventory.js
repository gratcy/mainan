exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.pname FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
					res.render('inventory',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};

