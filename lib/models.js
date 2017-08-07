var getOrder = function(conn,input) {
	var deferred = q.defer();
	
	var approval = '';
	var pid = '';
	var cid = '';
	var user = '';
	var date = '';
	var ttype = '';
	
	var datesort = input.datesort;
	var rres = datesort.split(' - ');
	var rfrom = rres[0];
	var rto = rres[1];
	var from = rres[0];
	var to = rres[1];
	from = from.split('/');
	to = to.split('/');
	from = from[2]+'-'+from[1]+'-'+from[0];
	to = to[2]+'-'+to[1]+'-'+to[0];
	
	if (datesort) date = " AND from_unixtime(b.tdate,'%Y-%m-%d')>='"+from+"' AND from_unixtime(b.tdate,'%Y-%m-%d')<='"+to+"'";

	if (input.approval == 2) approval = " AND (b.tstatus=1 OR b.tstatus=0 OR b.tstatus=3)";
	else if (input.approval == 1) approval = " AND b.tstatus=3";
	else approval = " AND (b.tstatus=1 OR b.tstatus=0)";
	
	if (input.pid && input.pid.length > 0) pid = " AND a.tpid IN ("+helpers.__implode(",", input.pid)+")";
	if (input.cid && input.cid.length > 0) cid = " AND b.tcid IN ("+helpers.__implode(",", input.cid)+")";

	if (input.user && input.user.length > 0) {
		if (input.user.length == 1) {
			user = " AND b.tcreatedby LIKE '{\"uid\":\""+input.user[0]+"\"%'";
		}
		else {
			var ruser = '';
			for(var i=0;i<input.user.length;++i) {
				var index = parseInt(input.user[i]);
				if (!isNaN(index)) {
					if (index > 0) {
						ruser += "b.tcreatedby LIKE '{\"uid\":"+index+"%' OR ";
					}
				}
			}
			user = " AND (" +ruser.slice(0,-4)+")";
		}
	}
	if (input.type && input.type.length > 0) {
			var rtype = '';
			for(var i=0;i<input.type.length;++i) {
				var index = parseInt(input.type[i]) + 1;
				if (!isNaN(index)) {
					if (index < 3) {
						rtype += "b.ttype=" + index + " OR ";
					}
				}
			}
			ttype = " AND (" +rtype.slice(0,-4)+")";
	}
	
	conn.getConnection(function(err,connection){
		var query_str = "SELECT a.tprice,a.tpricebase,a.tqty,b.tdate,b.tcreatedby,b.ttype,b.tno,b.tdesc,b.tammount,b.tdiscount,b.ttotal,c.pname FROM transaction_detail_tab a JOIN transaction_tab b ON a.ttid=b.tid JOIN products_tab c ON a.tpid=c.pid WHERE a.tstatus=1" + ttype + date + approval + pid + cid + user;
		var query = connection.query(query_str, function (err, rows, fields) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(rows);
			}
		});
	});

	return deferred.promise;
}

module.exports = {
	getOrder: getOrder,
}
