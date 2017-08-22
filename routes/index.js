import models_index from '../models/models_index';

exports.main = async function(req, res) {
	let totalProduct = await models_index.getHomeSummary(req,1);
	let totalCustomer = await models_index.getHomeSummary(req,2);
	let totalTransaction = await models_index.getHomeSummary(req,3);
	let totalSaldo = await models_index.getHomeSummary(req,4);
	
	let SumOrders = await models_index.getTotalOrderPerUser(req);
	console.log(SumOrders);

	res.render('index',{products:totalProduct[0],customers:totalCustomer[0],transaction:totalTransaction[0],saldo:totalSaldo[0],sum_orders:SumOrders});
};

exports.main_stats = async function(req, res) {
	let totalProduct = await models_index.getHomeSummary(req,1);
	let totalCustomer = await models_index.getHomeSummary(req,2);
	let totalTransaction = await models_index.getHomeSummary(req,3);
	let totalStock = await models_index.getHomeSummary(req,5);
	
	res.send({products:totalProduct[0],customers:totalCustomer[0],transaction:totalTransaction[0],stock:totalStock[0]});
};

