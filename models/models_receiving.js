var exports = module.exports = {};

exports.get_receiving = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        connection.query('SELECT a.*,b.vname FROM receiving_tab a LEFT JOIN vendor_tab b ON a.rvendor=b.vid WHERE (a.rstatus=1 OR a.rstatus=0 OR a.rstatus=3) ORDER BY a.rid DESC', function (err, rows, fields) {
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

exports.get_receiving_product = function(conn, type, ids) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
		if (type == 1)
			var query_str = 'SELECT a.rqty,b.*,c.cname FROM receiving_item_tab a INNER JOIN products_tab b ON a.rpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.riid='+ids+' AND a.rstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC';
		else
			var query_str = 'SELECT a.*,b.cname FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid WHERE a.pstatus=1 AND a.pid IN ('+ids+') ORDER BY a.pid DESC';
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
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT a.*,b.cname,d.istock FROM products_tab a JOIN categories_tab b ON a.pcid=b.cid JOIN inventory_tab d ON a.pid=d.ipid WHERE b.ctype=1 AND a.pstatus=1 ORDER BY a.pid DESC', function(err, rows, fields){
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

exports.get_receiving_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM receiving_tab WHERE (rstatus=1 OR rstatus=0) AND rid = ?', [id], function(err, rows, fields){
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

exports.get_receiving_detail_approved = function(conn, type, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
		if (type == 1)
			var query_str = 'SELECT a.*,b.vname FROM receiving_tab a LEFT JOIN vendor_tab b ON a.rvendor=b.vid WHERE a.rid = ?';
		else
			var query_str = 'SELECT a.rqty,b.*,c.cname FROM receiving_item_tab a INNER JOIN products_tab b ON a.rpid=b.pid JOIN categories_tab c ON b.pcid=c.cid WHERE a.riid = ? AND a.rstatus=1 AND b.pstatus=1 ORDER BY b.pid DESC';
        
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
