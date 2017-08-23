var exports = module.exports = {};

exports.get_retur_detail = function(conn, id) {
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

exports.get_retur_product = function(conn, type, ids) {
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

exports.get_retur = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT a.*,b.cname FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE (a.tstatus=1 OR a.tstatus=0 OR a.tstatus=3) AND a.ttype=2 ORDER BY a.tid DESC', function (err, rows, fields) {
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

exports.get_retur_detail_approved = function(conn, type, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
		if (type == 1)
			var query_str = 'SELECT a.*,b.cname FROM transaction_tab a LEFT JOIN customers_tab b ON a.tcid=b.cid WHERE a.ttype=2 AND a.tid = ?';
		else
			var query_str = 'SELECT a.tqty,a.tprice,a.tpricebase,a.ttype,b.pname,b.pdesc,c.cname FROM transaction_detail_tab a INNER JOIN products_tab b ON a.tpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.ttid = ? AND a.tstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC';
     
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
