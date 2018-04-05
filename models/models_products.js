var exports = module.exports = {};

exports.get_products_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM products_tab WHERE (pstatus=1 OR pstatus=0) AND pid = ?', [id], function(err, rows, fields){
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

exports.get_products_order = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT pid,pname,ppricepcs,ppricedozen,ppricekoli,ppricebasedozen,ppricebasekoli,ppricebasepcs FROM products_tab WHERE (pstatus=1 OR pstatus=0) AND pid = ?', [id], function(err, rows, fields){
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

exports.get_all_products_order = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT pid,pname,ppricepcs,ppricedozen,ppricekoli,ppricebasedozen,ppricebasekoli,ppricebasepcs FROM products_tab WHERE (pstatus=1 OR pstatus=0)', function(err, rows, fields){
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

exports.get_products_select = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT pid as id,CONCAT(pcode,\' | \',pname) as value FROM products_tab WHERE (pstatus=1 OR pstatus=0)', function(err, rows, fields){
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

exports.get_products = function(conn,type,params) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
		if (type == 1) {
			var sql = 'SELECT a.*,b.cname FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pstatus=1 OR a.pstatus=0) ORDER BY a.pid DESC';
		}
		else {
			var orderby = 'a.pid DESC';
			
			var search = params.search.value;
			var order = params.order;
			var start = params.start;
			var length = params.length;
			
			if (order) {
				if (helpers.__check_permission('ProductsPriceBase'))
					var col = ['b.cname','a.pcode','a.pdesc','a.ppricebasepcs','a.ppricebasekoli','a.ppricebasedozen','a.ppricepcs','a.ppricedozen','a.ppricekoli','a.pid'];
				else
					var col = ['b.cname','a.pcode','a.pdesc','a.ppricepcs','a.ppricedozen','a.ppricekoli'];
				orderby = col[order[0].column] + ' ' + order[0].dir;
			}
			
			if (search)
				var sql = 'SELECT a.*,b.cname FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pcode LIKE "%'+search+'%" OR a.pname LIKE "%'+search+'%" OR a.pdesc LIKE "%'+search+'%") AND (a.pstatus=1 OR a.pstatus=0) ORDER BY '+orderby+' LIMIT '+start+','+length;
			else
				var sql = 'SELECT a.*,b.cname FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pstatus=1 OR a.pstatus=0) ORDER BY '+orderby+' LIMIT '+start+','+length;
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

exports.get_products_total = function(conn,type,params) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
		if (type == 1) {
			var sql = 'SELECT COUNT(*) as total FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pstatus=1 OR a.pstatus=0) ORDER BY a.pid DESC';
		}
		else {
			var search = params.search.value;
			
			if (search)
				var sql = 'SELECT COUNT(*) as total FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pcode LIKE "%'+search+'%" OR a.pname LIKE "%'+search+'%" OR a.pdesc LIKE "%'+search+'%") AND (a.pstatus=1 OR a.pstatus=0)';
			else
				var sql = 'SELECT COUNT(*) as total FROM products_tab a LEFT JOIN categories_tab b ON a.pcid=b.cid WHERE (a.pstatus=1 OR a.pstatus=0)';
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
