var exports = module.exports = {};

exports.getTotalOrderPerUser = function(conn) {
	var deferred = q.defer();
	conn.getConnection(function(err,connection) {
		var query = connection.query('SELECT a.uemail,(SELECT SUM(b.ttotal) FROM transaction_tab b WHERE a.uid=b.tuid AND FROM_UNIXTIME( b.tdate,  \'%Y-%m-%d\' )=DATE(NOW()) AND b.tstatus!=2) as ttotal FROM users_tab a WHERE a.ustatus=1', function (err, rows, fields) {
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

exports.getHomeSummary = function(conn, type) {
	var deferred = q.defer();
	conn.getConnection(function(err,connection){
		if (type == 1) {
			var query_str = 'SELECT COUNT(*) as total FROM products_tab WHERE (pstatus=0 OR pstatus=1)';
		}
		else if (type == 2) {
			var query_str = 'SELECT COUNT(*) as total FROM customers_tab WHERE (cstatus=0 OR cstatus=1)';
		}
		else if (type == 3) {
			var query_str = 'SELECT COUNT(*) as total FROM transaction_tab WHERE (tstatus=0 OR tstatus=1)';
		}
		else if (type == 5) {
			var d = new Date();
			var month = parseInt(d.getMonth()) + 1;
			var year = d.getFullYear();

			var query_str = "SELECT psaldo as total FROM `peticash_tab` where MONTH(FROM_UNIXTIME( pdate,  '%Y-%m-%d' ))="+month+" and YEAR(FROM_UNIXTIME( pdate,  '%Y-%m-%d' ))="+year+" order by pid desc LIMIT 0,1";
		}
		else {
			var query_str = 'SELECT SUM(a.istock) as total FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0)';
		}
		
		var query = connection.query(query_str, function (err, rows, fields) {
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
