var exports = module.exports = {};

exports.get_vendor_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM vendor_tab WHERE (vstatus=1 OR vstatus=0) AND vid = ?', [id], function(err, rows, fields){
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

exports.get_vendor_select = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT vid as id,vname as value FROM vendor_tab WHERE (vstatus=1 OR vstatus=0)', function(err, rows, fields){
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

exports.get_vendor = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM vendor_tab WHERE (vstatus=1 OR vstatus=0) ORDER BY vid DESC', function (err, rows, fields) {
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
