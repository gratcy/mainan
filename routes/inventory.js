exports.list = function(req, res) {
	memcached.get('__msg' + req.sessionID, function (mem_err, mem_msg) {
		req.getConnection(function(err,connection){
			var query = connection.query('SELECT a.*,b.pname,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid ORDER BY a.ipid DESC',function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				res.render('inventory',{data:rows,error_msg:helpers.__get_error_msg(mem_msg,req.sessionID)});
			});
		});
	});
};


exports.stock_proccess = function(req, res) {
	var input = req.body;
	var pid = input.pids;
	req.getConnection(function(err,connection) {
		var query = connection.query('SELECT SUM(b.rqty) as total FROM receiving_tab a JOIN receiving_item_tab b ON a.rid=b.riid WHERE (a.rstatus=0 OR a.rstatus=1) AND b.rstatus=1 AND b.rpid='+pid,function(err,receive) {
			var query = connection.query('SELECT SUM(b.tqty) as total FROM transaction_tab a JOIN transaction_detail_tab b ON a.tid=b.ttid WHERE (a.tstatus=0 OR a.tstatus=1) AND b.tstatus=1 AND b.tpid='+pid,function(err,rows) {
				if (err) console.log("Error Selecting : %s ",err );
				var rreceive = 0;
				if (receive[0].total > 0) {
					rreceive = receive[0].total;
				}
				rtotal = rows[0].total - rreceive;
				res.send({total:rtotal});
			});
		});
	});
};
