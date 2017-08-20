var exports = module.exports = {};

exports.get_peticash = function(conn, month, year) {
    var deferred = q.defer();
    conn.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM peticash_tab WHERE pstatus=1 AND MONTH(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+month+' and YEAR(FROM_UNIXTIME( pdate,  \'%Y-%m-%d\' ))='+year+' ORDER BY pid DESC', function (err, rows, fields) {
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
