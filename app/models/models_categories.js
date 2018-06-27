var exports = module.exports = {};

exports.get_categories_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM categories_tab WHERE ctype=1 AND cid = ?', [id], function(err, rows, fields){
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

exports.get_categories_select = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT cid as id,cname as value FROM categories_tab WHERE (cstatus=1 OR cstatus=0)', function(err, rows, fields){
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

exports.get_categories = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM categories_tab WHERE (cstatus=1 OR cstatus=0) ORDER BY cid DESC', function (err, rows, fields) {
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
