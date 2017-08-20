var exports = module.exports = {};

exports.get_inventory = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        connection.query('SELECT a.*,b.pname,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid ORDER BY a.ipid DESC', function (err, rows, fields) {
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
				console.log(order[0].total);
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
