import models_inventory from '../models/models_inventory';

exports.list = async function(req, res) {
    var rows = await models_inventory.get_inventory(req);
    var mem_msg = await helpers.__get_memcached_data(req);
    var errorMsg = helpers.__get_error_msg(mem_msg,req.sessionID);
    
	res.render('inventory',{data:rows,error_msg:errorMsg});
};


exports.stock_proccess = async function(req, res) {
	var input = req.body;
	var pid = input.pids;
    var rows = await models_inventory.get_stock_proccess(req, pid);
    
	res.send({total:rows});
};
