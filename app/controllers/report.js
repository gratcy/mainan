import models_report from '../models/models_report';

exports.exec_transaction = async function(req, res) {
	var input = req.body;
	var format = input.format;
	var str = input.datesort;
	var approval = input.approval;
	var rtype = input.rtype;
	var type = input.type;
	
	if (!str) {
		helpers.__set_error_msg({error: 'Date Range harus di isi !!!'},req.sessionID);
		res.redirect('/reporttransaction');
	}
	else {
		var rres = str.split(' - ');
		var rfrom = rres[0];
		var rto = rres[1];
		var from = rres[0];
		var to = rres[1];
		from = from.split('/');
		to = to.split('/');
		from = from[2]+'-'+from[1]+'-'+from[0];
		to = to[2]+'-'+to[1]+'-'+to[0];
		
		if (format == 2) {
			res.setHeader('Content-disposition', 'attachment; filename=file.xls');
			res.setHeader('Content-type', 'application/vnd.ms-excel');
		}
		approval = (approval == 1 ? 'Yes' : (approval == 2 ? 'All' : 'No'));
		
		var data = await models_report.get_transaction(req, input);

		var rdata = [];
		var ttotalQTY = 0;
		var ttotalDisc = 0;
		var ttotalBru = 0;
		var ttotalNet = 0;
		for(var i=0;i<data.length;++i) {
			var obj = JSON.parse(data[i].tcreatedby);
			var qty = parseInt(data[i].tqty);
			var price = parseInt(data[i].tprice);
			var pricebase = (parseInt(data[i].tpricebase) / qty);
			var discount = parseInt(data[i].tdiscount) / qty;
			var netto = (((price/qty) - pricebase) * qty) - discount;
			var bruto = price;
			
			rdata.push({no:(i+1)+'.',uid:obj.uid,ttype:data[i].ttype,transType:data[i].transType,uemail:obj.uemail,netto:netto,bruto:bruto,tprice:(price/qty),tpricebase:pricebase,tdate:data[i].tdate,tcreatedby:data[i].tcreatedby,tno:data[i].tno,tdesc:data[i].tdesc,tqty:data[i].tqty,tammount:data[i].tammount,tdiscount:discount,ttotal:data[i].ttotal,pname:data[i].pname});
			
			ttotalQTY += qty;
			ttotalDisc += discount;
			ttotalBru += bruto;
			ttotalNet += netto;
		}
		
		var grantTotal = {ttotalNet:ttotalNet,ttotalQTY:ttotalQTY,ttotalDisc:ttotalDisc,ttotalBru:ttotalBru};
		
		if (rtype == 1) {
			rdata = rdata;
		}
		else if (rtype == 2) {
			var gTrans = [];
			var transT = ['Purchase Order', 'Return Order', 'Item Receiving'];
			var foo = _.groupBy(rdata, 'ttype');
			Object.keys(foo).map(function(objectKey, index) {
				var as = [];
				for(var i=0;i<foo[objectKey].length;++i) {
					bam = foo[objectKey][i];
					var qty = parseInt(bam.tqty);
					var price = parseInt(bam.tprice);
					var pricebase = parseInt(bam.tpricebase);
					var discount = parseInt(bam.tdiscount);
					var netto = ((price - pricebase) * qty) - discount;
					var bruto = price;
					var uid = bam.uid;
					
					as.push({no:(i+1)+'.',ttype:bam.ttype,uid:bam.uid,uemail:bam.uemail,netto:netto,bruto:bruto,tprice:price,tpricebase:pricebase,tdate:bam.tdate,tcreatedby:bam.tcreatedby,tno:bam.tno,tdesc:bam.tdesc,tqty:bam.tqty,tammount:bam.tammount,tdiscount:discount,ttotal:bam.ttotal,pname:bam.pname});
				}
				gTrans.push(as);
			});
			rdata = gTrans;
		}
		else {
			var guser = [];
			var foo = _.groupBy(rdata, 'uid');
			
			Object.keys(foo).map(function(objectKey, index) {
				var as = [];
				for(var i=0;i<foo[objectKey].length;++i) {
					bam = foo[objectKey][i];
					var qty = parseInt(bam.tqty);
					var price = parseInt(bam.tprice);
					var pricebase = parseInt(bam.tpricebase);
					var discount = parseInt(bam.tdiscount);
					var netto = ((price - pricebase) * qty) - discount;
					var bruto = price;
					var uid = bam.uid;
					
					as.push({no:(i+1)+'.',uid:bam.uid,uemail:bam.uemail,netto:netto,bruto:bruto,tprice:price,tpricebase:pricebase,tdate:bam.tdate,tcreatedby:bam.tcreatedby,tno:bam.tno,tdesc:bam.tdesc,tqty:bam.tqty,tammount:bam.tammount,tdiscount:discount,ttotal:bam.ttotal,pname:bam.pname});
				}
				guser.push(as);
			});
			rdata = guser;
		}
		
		
		if (rtype == 1)
			res.render('print/reporttransaction_all',{grantTotal:grantTotal,approval:approval,type:type,rtype:rtype,from:rfrom,to:rto,data:rdata,layout: false});
		else if (rtype == 2)
			res.render('print/reporttransaction_group_transaction',{grantTotal:grantTotal,approval:approval,type:type,rtype:rtype,from:rfrom,to:rto,data:rdata,layout: false});
		else
			res.render('print/reporttransaction_group_user',{grantTotal:grantTotal,approval:approval,type:type,rtype:rtype,from:rfrom,to:rto,data:rdata,layout: false});
	}
};

exports.transaction = function(req, res) {
	var newdate = new Date();
	newdate.setMonth(newdate.getMonth() - 1);
	var nd = new Date(newdate);
	var from = helpers.__get_date(Math.floor(nd / 1000),1);
	var to = helpers.__get_date(0,1);
	
	res.render('reporttransaction',{from:from,to:to});
};

exports.opname = async function(req, res) {
	var newdate = new Date();
	newdate.setMonth(newdate.getMonth() - 1);
	var nd = new Date(newdate);
	var rfrom = helpers.__get_date(Math.floor(nd / 1000),1);
	var rto = helpers.__get_date(0,1);
	var from = rfrom.split('/');
	var to = rto.split('/');
	
	from = from[2]+'-'+from[1]+'-'+from[0];
	to = to[2]+'-'+to[1]+'-'+to[0];
	
    var rows = await models_report.get_report_opname(req, from, to);
	
	res.render('reportopname',{from:rfrom,to:rto,data:rows});
};

exports.exec_opname = async function(req, res) {
	var input = req.body;
	var str = input.datesort;
	
	if (!str) {
		helpers.__set_error_msg({error: 'Date Range harus di isi !!!'},req.sessionID);
		res.redirect('/reportopname');
	}
	else {
		var rres = str.split(' - ');
		var rfrom = rres[0];
		var rto = rres[1];
		var from = rres[0];
		var to = rres[1];
		from = from.split('/');
		to = to.split('/');
		from = from[2]+'-'+from[1]+'-'+from[0];
		to = to[2]+'-'+to[1]+'-'+to[0];
		
		var rows = await models_report.get_report_opname(req, from, to);
		
		res.render('reportopname',{from:rfrom,to:rto,data:rows});
	}
};

exports.exec_stock = async function(req, res) {
	var input = req.body;
	var str = input.datesort;
	var pid = input.pid;
	var format = input.format;
	
	if (!str) {
		helpers.__set_error_msg({error: 'Date Range harus di isi !!!'},req.sessionID);
		res.redirect('/reportstock');
	}
	else {
		var rres = str.split(' - ');
		var rfrom = rres[0];
		var rto = rres[1];
		var from = rres[0];
		var to = rres[1];
		from = from.split('/');
		to = to.split('/');
		from = from[2]+'-'+from[1]+'-'+from[0];
		to = to[2]+'-'+to[1]+'-'+to[0];
		
		if (typeof pid != 'undefined') {
			var tpids = '';
			for(var i=0;i<pid.length;++i) {
				var index = parseInt(pid[i]);
				if (!isNaN(index)) {
					if (index > 0) {
						tpids += index + ',';
					}
				}
			}
			if (tpids)
				pid = tpids.slice(0,-1);
			else
				pid = 0;
		}
		else {
			pid = 0;
		}
		
		var ndFrom = new Date(from);
		var ndTo = new Date(to);
		var datediff = (ndTo / 1000) - (ndFrom / 1000);
		datediff = Math.floor((datediff / (60 * 60 * 24)));
		
		var rows = await models_report.get_report_stock(req, from, to, pid);
		
		var rdata = [];
		var avg = 0;
		var proccess = 0;
		var left = 0;
		var countdown = 0;
		
		for(var i=0;i<rows.length;++i) {
			avg = parseInt(Math.ceil(parseInt(rows[i].totalout) / datediff));
			proccess = 0;
			left = rows[i].istock - proccess;
			countdown = Math.ceil(avg > 0 ? left / avg : 0);
			rdata.push({no:(i+1)+'.',pid:rows[i].pid,pname:rows[i].pname,istock:rows[i].istock,totalout:rows[i].totalout,avg:avg,countdown:countdown,left:left,proccess:proccess});
		}
		
		if (format == 2) {
			res.setHeader('Content-disposition', 'attachment; filename=file.xls');
			res.setHeader('Content-type', 'application/vnd.ms-excel');
		}
		res.render('print/reportstock',{datediff:datediff,from:rfrom,to:rto,data:rdata,layout: false});
	}
};

exports.stock = function(req, res) {
	var newdate = new Date();
	newdate.setMonth(newdate.getMonth() - 1);
	var nd = new Date(newdate);
	var from = helpers.__get_date(Math.floor(nd / 1000),1);
	var to = helpers.__get_date(0,1);
	
	res.render('reportstock',{from:from,to:to});
};

exports.bestseller = async function(req, res) {
	var d = new Date();
    d.setMonth(d.getMonth()-1);
	var month = d.getUTCMonth() + 1; //months from 1-12
	month = (month < 10 ? '0'+month : month)
	var day = d.getUTCDate();
	var year = d.getUTCFullYear();
	var from = year + "-" + month + "-" + day;
	var to = year + "-" + parseInt(month)+1 + "-" + day;
	
    var rows = await models_report.get_bestseller(req,from);
    
	res.render('report_bestseller',{data:rows,from:from,to:to});
};

