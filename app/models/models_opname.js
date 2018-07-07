var exports = module.exports = {};

exports.get_opname_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT a.*,b.pname,b.pdesc FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (a.istatus=1 OR a.istatus=0) AND a.ipid= ?', [id], function(err, rows, fields){
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

exports.get_opname = function(conn, params) {
    var deferred = q.defer();
    
    var search = params.search.value;
    var order = params.order;
    var start = params.start;
    var length = params.length;
    var orderby = 'a.ipid DESC';
    
    if (order) {
        var col = ['b.pname','a.istockbegining','a.istockin','a.istockout','a.istockreturn','a.istock','a.ipid','a.ipid','aplus','amin','a.ipid','a.ipid'];
        orderby = col[order[0].column] + ' ' + order[0].dir;
    }
    
    conn.getConnection(function(err,connection){
        if (search) {
            var sql = 'SELECT a.*,b.pname,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) AND b.pname LIKE "%'+search+'%" ORDER BY '+orderby+' LIMIT '+start+','+length;
        }
        else {
            var sql = 'SELECT a.*,b.pname,(SELECT IFNULL(SUM(c.oadjustmin),0) FROM opname_tab c WHERE c.oidid=a.ipid) as amin,(SELECT IFNULL(SUM(d.oadjustplus),0) FROM opname_tab d WHERE d.oidid=a.ipid) as aplus FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid WHERE (b.pstatus=1 OR b.pstatus=0) ORDER BY '+orderby+' LIMIT '+start+','+length;
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

exports.get_opname_total = function(conn, params) {
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