import config from './app/config/settings';

const path = require('path'),
	http = require('http'),
    fs = require('fs'),
    mysql = require('mysql'),
    Memcached = require('memcached');
const _ = require("underscore");

global.conf = config;
global._ = _;

export const memcached = new Memcached(conf.memcached.host+':'+conf.memcached.port,conf.memcached.options);

global.memcached = memcached;

const express = require('express'),
	session = require('express-session'),
	hbs = require('express-handlebars'),
	db  = require('express-myconnection'),
	helpers = require('./app/lib/functions'),
	bodyParser = require('body-parser'),
	memcachedStore = require('connect-memcached')(session);

const app = express();
const server = http.createServer(app);
const q = require('q');

global.q = q;
global.helpers = helpers.helpers;

const index = require('./app/controllers/index'),
	login = require('./app/controllers/login'),
	settings = require('./app/controllers/settings'),
	vendor = require('./app/controllers/vendor'),
	order = require('./app/controllers/order'),
	retur = require('./app/controllers/retur'),
	report = require('./app/controllers/report'),
	receiving = require('./app/controllers/receiving'),
	categories = require('./app/controllers/categories'),
	products = require('./app/controllers/products'),
	customers = require('./app/controllers/customers'),
	inventory = require('./app/controllers/inventory'),
	opname = require('./app/controllers/opname'),
	city = require('./app/controllers/city'),
	province = require('./app/controllers/province'),
	peticash = require('./app/controllers/peticash'),
	users_group = require('./app/controllers/users_group'),
	users = require('./app/controllers/users');

app.set('port', config.web.port);
app.set('host', config.web.host);

const viewsPath = path.join(__dirname, 'app', 'views');
app.set('views', viewsPath);

const hbsHelpers = hbs.create({
	helpers: helpers.helpers,
	extname:'hbs',
	defaultLayout:'main',
	layoutsDir: `${viewsPath}/layouts/`,
	partialsDir: `${viewsPath}/partials/`
});

app.use(session({
    secret: 'mainanBocah',
    name: 'mainanBocah321',
    proxy: true,
    resave: true,
    saveUninitialized: true,
    store : new memcachedStore({
        hosts: [conf.memcached.host+':'+conf.memcached.port],
        secret: '123, easy as ABC. ABC, easy as 123'
    })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));
app.use(
    db(mysql,{
		host: conf.mysql.host,
		user: conf.mysql.user,
		password: conf.mysql.password,
		database: conf.mysql.db
    })
);

app.engine('.hbs', hbsHelpers.engine);
app.set('view engine', '.hbs');

app.use(function(req, res, next){
	global.sauth = '';
	if (/\/login/.test(req.path) === false) {
		global.sauth = req.session.login;
		if (!req.session.login) {
			return res.redirect('/login');
		}
		else {
			if (!req.session.login.uid || !req.session.login.uemail) {
				return res.redirect('/login');
			}
			
			for(let i=0;i<global.sauth.perms.length;++i) {
				if (global.sauth.perms[i].url != null) {
					let pattern = global.sauth.perms[i].url;
					let regex = new RegExp(pattern,'g');
					if (regex.test(req.path) === true) {
						if (req.path != '/' && /\/ajax/.test(req.path) == false) {
							if (global.sauth.perms[i].access != 1) {
								return res.redirect('/');
							}
							break;
						}
					}
				}
			}
		}
	}
	else {
		if (req.session.login) {
			if (/\/login/.test(req.path) === true) {
				if (/\/login\/logout/.test(req.path) === false) {
					return res.redirect('/');
				}
			}
		}
	}
	return next();
});

app.get('/', index.main);
app.get('/ajax/index', index.main_stats);

app.get('/ajax/categories', categories.list_ajax);
app.get('/categories', categories.list);
app.get('/categories/categories_add', categories.add);
app.post('/categories/categories_add', categories.categories_add);
app.get('/categories/categories_update/:id', categories.categories_detail);
app.post('/categories/categories_update',categories.categories_update);
app.get('/categories/categories_delete/:id', categories.categories_delete);

app.get('/ajax/province', province.list_ajax);
app.get('/province', province.list);
app.get('/province/province_add', province.add);
app.post('/province/province_add', province.province_add);
app.get('/province/province_update/:id', province.province_detail);
app.post('/province/province_update',province.province_update);
app.get('/province/province_delete/:id', province.province_delete);

app.get('/ajax/city', city.list_ajax);
app.get('/city', city.list);
app.get('/city/city_add', city.add);
app.post('/city/city_add', city.city_add);
app.get('/city/city_update/:id', city.city_detail);
app.post('/city/city_update',city.city_update);
app.get('/city/city_delete/:id', city.city_delete);

app.get('/ajax/customers', customers.list_ajax);
app.get('/ajax/customers_detail/:id', customers.customers_detail_ajax);
app.get('/customers', customers.list);
app.get('/customers/customer_quick_add', customers.quick_add);
app.post('/customers/customer_quick_add', customers.customers_quick_add);
app.get('/customers/customers_add', customers.add);
app.post('/customers/customers_add', customers.customers_add);
app.get('/customers/customers_update/:id', customers.customers_detail);
app.post('/customers/customers_update',customers.customers_update);
app.get('/customers/customers_delete/:id', customers.customers_delete);

app.get('/ajax/vendor', vendor.list_ajax);
app.get('/vendor', vendor.list);
app.get('/vendor/vendor_add', vendor.add);
app.post('/vendor/vendor_add', vendor.vendor_add);
app.get('/vendor/vendor_update/:id', vendor.vendor_detail);
app.post('/vendor/vendor_update',vendor.vendor_update);
app.get('/vendor/vendor_delete/:id', vendor.vendor_delete);

app.get('/ajax/products', products.list_ajax);
app.get('/products', products.list);
app.get('/products/products_add', products.add);
app.post('/products/products_add', products.products_add);
app.get('/products/products_update/:id', products.products_detail);
app.post('/products/products_update',products.products_update);
app.get('/products/products_delete/:id', products.products_delete);
app.get('/products/export_product', products.export_product);
app.get('/products/list_datatables', products.list_datatables);

app.get('/login/logging', login.main);
app.get('/login', login.main);
app.post('/login/logging', login.login);
app.get('/login/logout', login.logout);

app.get('/inventory', inventory.list);
app.get('/inventory/list_datatables', inventory.list_datatables);

app.get('/opname', opname.list);
app.get('/opname/list_datatables', opname.list_datatables);
app.get('/opname/opname_update/:id', opname.opname_detail);
app.post('/opname/opname_update', opname.opname_update);

app.get('/settings', settings.settings);
app.post('/settings/settings', settings.settings_update);

app.get('/ajax/users', users.list_ajax);
app.get('/users', users.list);
app.get('/users/users_add', users.add);
app.post('/users/users_add', users.users_add);
app.get('/users/users_update/:id', users.users_detail);
app.post('/users/users_update',users.users_update);
app.get('/users/users_delete/:id', users.users_delete);

app.get('/receiving', receiving.list);
app.get('/receiving/receiving_products/?:id?', receiving.products);
app.get('/receiving/receiving_list_products/?:id?', receiving.list_products);
app.post('/receiving/receiving_products_add', receiving.products_add);
app.post('/receiving/receiving_products_delete', receiving.products_delete);
app.get('/receiving/receiving_add', receiving.add);
app.post('/receiving/receiving_add', receiving.receiving_add);
app.get('/receiving/receiving_update/:id', receiving.receiving_detail);
app.get('/receiving/receiving_detail/:id', receiving.receiving_detail_approved);
app.post('/receiving/receiving_update',receiving.receiving_update);
app.get('/receiving/receiving_delete/:id', receiving.receiving_delete);

app.get('/ajax/users_group', users_group.list_ajax);
app.get('/users_group', users_group.list);
app.get('/users_group/users_group_add', users_group.add);
app.post('/users_group/users_group_add', users_group.users_group_add);
app.get('/users_group/users_group_update/:id', users_group.users_group_detail);
app.post('/users_group/users_group_update',users_group.users_group_update);
app.get('/users_group/users_group_delete/:id', users_group.users_group_delete);

app.get('/order', order.list);
app.get('/order/faktur/?:id?', order.order_faktur);
app.get('/order/order_products/?:id?', order.products);
app.get('/order/order_list_products/?:id?', order.list_products);
app.post('/order/order_products_add', order.products_add);
app.post('/order/order_products_delete', order.products_delete);
app.get('/order/order_add', order.add);
app.post('/order/order_add', order.order_add);
app.get('/order/order_update/:id', order.order_detail);
app.get('/order/order_detail/:id', order.order_detail_approved);
app.post('/order/order_update',order.order_update);
app.get('/order/order_delete/:id', order.order_delete);
app.get('/order/list_datatables', order.list_datatables);

app.get('/retur', retur.list);
app.get('/retur/faktur/?:id?', retur.retur_faktur);
app.get('/retur/retur_products/?:id?', retur.products);
app.get('/retur/retur_list_products/?:id?', retur.list_products);
app.post('/retur/retur_products_add', retur.products_add);
app.post('/retur/retur_products_delete', retur.products_delete);
app.get('/retur/retur_add', retur.add);
app.post('/retur/retur_add', retur.retur_add);
app.get('/retur/retur_update/:id', retur.retur_detail);
app.get('/retur/retur_detail/:id', retur.retur_detail_approved);
app.post('/retur/retur_update',retur.retur_update);
app.get('/retur/retur_delete/:id', retur.retur_delete);

app.get('/peticash', peticash.list);
app.post('/peticash', peticash.list_post);
app.get('/peticash/peticash_add', peticash.add);
app.post('/peticash/peticash_add', peticash.peticash_add);

app.get('/reporttransaction', report.transaction);
app.post('/reporttransaction', report.exec_transaction);
app.get('/reportstock', report.stock);
app.post('/reportstock/products', report.exec_stock);
app.get('/reportopname', report.opname);
app.post('/reportopname', report.exec_opname);
app.get('/reportbestseller', report.bestseller);

app.use(function(req, res, next){
	res.render('404', { status: 404, url: req.url });
});

server.listen(app.get('port'), () => {
	console.log('Express server listening on host: '+app.get('host')+' port: ' + app.get('port'));
});

process.on('SIGINT', () => {
	process.exit(1)
})

memcached.end();