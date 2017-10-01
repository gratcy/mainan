var exports = module.exports = {};

exports.get_customers_detail = function(conn, id) {
    var deferred = q.defer();
    conn.getConnection(function(err, connection){
        var query = connection.query('SELECT * FROM customers_tab WHERE (cstatus=1 OR cstatus=0) AND cid = ?', [id], function(err, rows, fields){
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

exports.get_customers_select = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT cid as id,cname as value FROM customers_tab WHERE (cstatus=1 OR cstatus=0)', function(err, rows, fields){
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

exports.get_customers = function(conn) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT a.*,b.cname as city,c.pname as province FROM customers_tab a LEFT JOIN city_tab b ON a.ccity=b.cid LEFT JOIN province_tab c ON a.cprovince=c.pid WHERE (a.cstatus=1 OR a.cstatus=0) ORDER BY a.cid DESC', function (err, rows, fields) {
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

exports.insert_customers = function(conn, data) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('INSERT INTO customers_tab SET ? ', data, function (err, rows) {
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

exports.update_customers = function(conn, data, id) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query("UPDATE customers_tab set ? WHERE cid = ? ",[data,id], function(err, rows) {
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
