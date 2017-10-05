var exports = module.exports = {};

exports.get_order_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM transaction_tab WHERE tid = ?', [id], function(err, rows, fields){
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

exports.get_order_products = function(conn, type, ids) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
		if (type == 1)
			var query_str = 'SELECT a.tqty,a.ttype,b.*,c.cname FROM transaction_detail_tab a INNER JOIN products_tab b ON a.tpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.ttid='+ids+' AND a.tstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC';
		else
			var query_str = 'SELECT a.*,b.cname,0 as ttype FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid WHERE a.pstatus=1 AND a.pid IN ('+ids+') ORDER BY a.pid DESC';
    
        var query = connection.query(query_str, function(err, rows, fields){
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

exports.get_list_products = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT a.*,b.cname,d.istock FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid JOIN inventory_tab d ON a.pid=d.ipid WHERE b.ctype=1 AND a.pstatus=1 ORDER BY a.pid DESC', function (err, rows, fields) {
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

exports.get_order_total = function(conn, params) {
    var deferred = q.defer();
	var search = params.search.value;
	
    conn.getConnection(function(err,connection){
		if (search) {
			var sql = 'SELECT COUNT(*) as total FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) AND (a.tno LIKE "%'+search+'%" OR b.cname LIKE "%'+search+'%" OR a.tcreatedby LIKE "%'+search+'%" OR a.tapprovedby LIKE "%'+search+'%") AND a.ttype=1';
		}
		else {
			var sql = 'SELECT COUNT(*) as total FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) AND a.ttype=1';
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

exports.get_order = function(conn, params) {
    var deferred = q.defer();
	
	var search = params.search.value;
	var order = params.order;
	var start = params.start;
	var length = params.length;
	var orderby = 'a.tid DESC';
	
	if (order) {
		var col = ['a.tno','a.tdate','b.cname','a.tqty','a.tammount','a.tdiscount','a.ttotal','a.tid','a.tid'];
		orderby = col[order[0].column] + ' ' + order[0].dir;
	}
	
    conn.getConnection(function(err,connection){
		if (search) {
			var sql = 'SELECT a.*,b.cname FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) AND (a.tno LIKE "%'+search+'%" OR b.cname LIKE "%'+search+'%" OR a.tcreatedby LIKE "%'+search+'%" OR a.tapprovedby LIKE "%'+search+'%") AND a.ttype=1 ORDER BY '+orderby+' LIMIT '+start+','+length;
		}
		else {
			var sql = 'SELECT a.*,b.cname FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) AND a.ttype=1 ORDER BY '+orderby+' LIMIT '+start+','+length;
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

exports.get_product_exists = function(conn,tid,pid) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM transaction_detail_tab WHERE ttid='+tid+' AND tpid=' + pid, function (err, rows, fields) {
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

exports.get_order_detail_approved = function(conn, type, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
		if (type == 1)
			var query_str = 'SELECT a.*,b.cname,c.unick FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid JOIN users_tab c ON a.tuid=c.uid WHERE a.ttype=1 AND a.tid = ?';
		else
			var query_str = 'SELECT a.tqty,a.tprice,a.tpricebase,a.ttype,b.pcode,b.pname,b.pdesc,b.ppricedozen,c.cname FROM transaction_detail_tab a INNER JOIN products_tab b ON a.tpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.ttid = ? AND a.tstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC';
     
        var query = connection.query(query_str, [id], function(err, rows, fields){
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
