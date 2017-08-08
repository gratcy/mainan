var getReceiving = function(conn,input) {
	var deferred = q.defer();
	
	var approval = '';
	var pid = '';
	var user = '';
	var date = '';
	
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
	
	if (datesort) date = " AND from_unixtime(b.rdate,'%Y-%m-%d')>='"+from+"' AND from_unixtime(b.rdate,'%Y-%m-%d')<='"+to+"'";

	if (input.approval == 2) approval = " AND (b.rstatus=1 OR b.rstatus=0 OR b.rstatus=3)";
	else if (input.approval == 1) approval = " AND b.rstatus=3";
	else approval = " AND (b.rstatus=1 OR b.rstatus=0)";
	
	if (input.pid && input.pid.length > 0) pid = " AND a.rpid IN ("+helpers.__implode(",", input.pid)+")";

	if (input.user && input.user.length > 0) {
		if (input.user.length == 1) {
			user = " AND b.rcreatedby LIKE '{\"uid\":\""+input.user[0]+"\"%'";
		}
		else {
			var ruser = '';
			for(var i=0;i<input.user.length;++i) {
				var index = parseInt(input.user[i]);
				if (!isNaN(index)) {
					if (index > 0) {
						ruser += "b.rcreatedby LIKE '{\"uid\":"+index+"%' OR ";
					}
				}
			}
			user = " AND (" +ruser.slice(0,-4)+")";
		}
	}
	
	conn.getConnection(function(err,connection){
		var query_str = "SELECT a.rprice as tprice,a.rpricebase as tpricebase,a.rqty as tqty,b.rdate as tdate,b.rcreatedby as tcreatedby,b.rdocno as tno,b.rdesc as tdesc,c.pname,3 as ttype,d.vname as cname FROM receiving_item_tab a JOIN receiving_tab b ON a.riid=b.rid JOIN products_tab c ON a.rpid=c.pid JOIN vendor_tab d ON b.rvendor=d.vid WHERE a.rstatus=1" + date + approval + pid + user;
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
};

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
		var query_str = "SELECT a.tprice,a.tpricebase,a.tqty,b.tdate,b.tcreatedby,b.ttype,b.tno,b.tdesc,b.tammount,b.tdiscount,b.ttotal,c.pname,d.cname FROM transaction_detail_tab a JOIN transaction_tab b ON a.ttid=b.tid JOIN products_tab c ON a.tpid=c.pid JOIN customers_tab d ON b.tcid=d.cid WHERE a.tstatus=1" + ttype + date + approval + pid + cid + user;
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
	getReceiving: getReceiving,
	getOrder: getOrder,
}
