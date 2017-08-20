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

exports.get_opname = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT a.*,b.pname FROM inventory_tab a JOIN products_tab b ON a.ipid=b.pid ORDER BY a.ipid DESC', function (err, rows, fields) {
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
