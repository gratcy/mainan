import models_inventory from '../models/models_inventory';

exports.list = async function(req, res) {
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('inventory',{error_msg:errorMsg});
};

exports.list_datatables = async function(req, res) {
	var params = req.query;
	var draw = params.draw;
    var rows = await models_inventory.get_inventory(req,params);
    var total = await models_inventory.get_inventory_total(req,params);
	var data = [];

	const getStockProccess = async (pid) => {
		return models_inventory.get_stock_proccess(req, pid);
	}
	
	for(var i=0;i<rows.length;++i) {
		var execute = '<a href="'+helpers.__site_url('order/opname_update/'+rows[i].ipid)+'"><i class="fa fa-pencil"></i></a>';
		if (!helpers.__check_permission('OpnameExecute')) {
			execute = '';
		}

		var totalProccess = await getStockProccess(rows[i].ipid)
		var proccess = totalProccess
		var left = parseInt(totalProccess) + parseInt(rows[i].istock)
		var stockDus = (parseFloat(rows[i].istock) / parseFloat(rows[i].pkoliqty || 0)) || 0
		if (stockDus && helpers.__isFloat(stockDus)) {
			stockDus = stockDus.toFixed(1);
		}

		data.push([rows[i].pname, rows[i].istockbegining, rows[i].istockin, rows[i].istockout, rows[i].istockreturn, rows[i].istock, stockDus, rows[i].aplus, rows[i].amin, proccess, left, execute]);
	}

	res.send({data:data,draw:draw,recordsTotal:total[0].total,recordsFiltered:total[0].total});
};