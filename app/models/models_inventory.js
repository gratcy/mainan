var exports = module.exports = {};

exports.get_inventory = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        connection.query('SELECT a.*,b.pname,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) ORDER BY a.ipid DESC', function (err, rows, fields) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(rows);
            }
        });
    });

    return deferred.promise;
};

exports.get_inventory = function(conn, params) {
    var deferred = q.defer();
	
	var search = params.search.value;
	var order = params.order;
	var start = params.start;
	var length = params.length;
	var orderby = 'a.ipid DESC';
	
	if (order) {
		var col = ['b.pname','a.istockbegining','a.istockin','a.istockout','a.istockreturn','a.istock','a.ipid','a.ipid','a.ipid'];
		orderby = col[order[0].column] + ' ' + order[0].dir;
	}
	
    conn.getConnection(function(err,connection){
		if (search) {
			var sql = 'SELECT a.*,b.pname,b.pkoliqty,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) AND b.pname LIKE "%'+search+'%" ORDER BY '+orderby+' LIMIT '+start+','+length;
		}
		else {
			var sql = 'SELECT a.*,b.pname,b.pkoliqty,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) ORDER BY '+orderby+' LIMIT '+start+','+length;
		}
        var query = connection.query(sql, function (err, rows, fields) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(rows);
            }
        });
    });

    return deferred.promise;
};

exports.get_inventory_total = function(conn, params) {
    var deferred = q.defer();
	var search = params.search.value;
	
    conn.getConnection(function(err,connection){
		if (search) {
			var sql = 'SELECT COUNT(*) as total FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) AND b.pname LIKE "%'+search+'%"';
		}
		else {
			var sql = 'SELECT COUNT(*) as total FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0)';
		}
		
        var query = connection.query(sql, function (err, rows, fields) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(rows);
            }
        });
    });

    return deferred.promise;
};

exports.get_stock_proccess = function(conn, pid) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
		connection.query('SELECT SUM(b.rqty) as total FROM receiving_tab a JOIN receiving_item_tab b ON a.rid=b.riid WHERE (a.rstatus=0 OR a.rstatus=1) AND b.rstatus=1 AND b.rpid='+pid, function (err, receiving, fields) {
			connection.query('SELECT SUM(b.tqty) as total FROM transaction_tab a JOIN transaction_detail_tab b ON a.tid=b.ttid WHERE (a.tstatus=0 OR a.tstatus=1) AND b.tstatus=1 AND b.tpid='+pid, function (err, order, fields) {
				if (err) {
					deferred.reject(err);
				}
				else {
					var orderTotal = 0;
					if (order[0].total > 0) {
						orderTotal = parseInt(order[0].total);
					}
					
					var receivingTotal = 0;
					if (receiving[0].total > 0) {
						receivingTotal = parseInt(receiving[0].total);
					}
					
					deferred.resolve(orderTotal - receivingTotal);
				}
			});
        });
    });

    return deferred.promise;
};
