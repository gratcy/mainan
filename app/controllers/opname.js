import models_opname from '../models/models_opname';
import models_inventory from '../models/models_inventory';

exports.list = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('opname',{error_msg:errorMsg});
};

exports.list_datatables = async function(req, res) {
	var params = req.query;
	var draw = params.draw;

    var rows = await models_opname.get_opname(req,params);
    var total = await models_opname.get_opname_total(req,params);
	var data = [];
	
	const getStockProccess = async (pid) => {
		return await models_inventory.get_stock_proccess(req, pid);
	}

	for(var i=0;i<rows.length;++i) {
		var execute = '<a href="'+helpers.__site_url('order/opname_update/'+rows[i].ipid)+'"><i class="fa fa-pencil"></i></a>';
		if (!helpers.__check_permission('OpnameExecute')) {
			execute = '';
		}

		var totalProccess = await getStockProccess(rows[i].ipid)
		var proccess = totalProccess
		var left = parseInt(totalProccess) + parseInt(rows[i].istock)
		
		data.push([rows[i].pname, rows[i].istockbegining, rows[i].istockin, rows[i].istockout, rows[i].istockreturn, rows[i].istock, proccess, left, execute]);
	}
	
	res.send({data:data,draw:draw,recordsTotal:total[0].total,recordsFiltered:total[0].total});
};

exports.opname_detail = async function(req, res) {
	var id = req.params.id;
    var rows = await models_opname.get_opname_detail(req, id);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
	
	res.render('opname_update',{data:rows[0],id:id,error_msg:errorMsg});
};

exports.opname_update = function(req,res) {
	var input = req.body;
	var id = input.id;
	if (id) {
		if (input.adjustplus && input.adjustmin) {
			helpers.__set_error_msg({error: 'Adjust min dan plus salah satu harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else if (!input.adjustplus && !input.adjustmin) {
			helpers.__set_error_msg({error: 'Adjust min dan plus salah satu harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else if (!input.desc) {
			helpers.__set_error_msg({error: 'Keterangan harus di isi !!!'},req.sessionID);
			res.redirect('/opname/opname_update/' + id);
		}
		else {
			var sfinal = 0;
			var adjustplus = input.adjustplus ? parseInt(input.adjustplus) : 0;
			var adjustmin = input.adjustmin ? parseInt(input.adjustmin) : 0;
			var sfinal2 = input.sfinal2 ? parseInt(input.sfinal2) : 0;
			
			if (adjustplus) sfinal = sfinal2 + adjustplus;
			else sfinal = sfinal2 - adjustmin;
			
			req.getConnection(function (err, connection) {
				var data = {
					istock : sfinal
				};

				connection.query("UPDATE inventory_tab set ? WHERE ipid = ? ",[data,id], function(err, rows) {
					if (err) {
						console.log("Error Selecting : %s ",err );
						helpers.__set_error_msg({error : 'Gagal update data !!!'},req.sessionID);
						res.redirect('/opname');
					}
					else {
						var rdata = {
							oidid : id,
							odate : helpers.__get_date_now(),
							ostockbegining : input.sbegin2,
							ostockin : input.sin2,
							ostockout : input.sout2,
							ostock : input.sfinal2,
							oadjustmin : adjustmin,
							oadjustplus : adjustplus,
							odesc : input.desc,
							ostatus : 1
						};

						var rquery = connection.query("INSERT INTO opname_tab SET ? ",rdata, function(err, rows) {
							if (err) {
								console.log("Error Selecting : %s ",err );
							}
							
							helpers.__set_error_msg({info : 'Data berhasil diubah.'},req.sessionID);
							res.redirect('/opname');
						});
					}
				});
			});
		}
	}
	else {
		helpers.__set_error_msg({error : 'Kesalahan input data !!!'},req.sessionID);
		res.redirect('/opname');
	}
};
