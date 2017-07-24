var path = require('path'),
	config = require('./config/settings'),
	http = require('http'),
    fs = require('fs'),
    mysql = require('mysql'),
    Memcached = require('memcached');

global.conf = config;

var memcached = new Memcached(conf.memcached.host+':'+conf.memcached.port,conf.memcached.options);

global.memcached = memcached;

var express = require('express'),
	session = require('express-session'),
	hbs = require('express-handlebars'),
	db  = require('express-myconnection'),
	helpers = require('./lib/functions'),
	bodyParser = require('body-parser'),
	memcachedStore = require('connect-memcached')(session);

var app = express();

global.helpers = helpers.helpers;
var index = require('./routes/index'),
	login = require('./routes/login'),
	settings = require('./routes/settings'),
	categories = require('./routes/categories'),
	products = require('./routes/products'),
	customers = require('./routes/customers'),
	inventory = require('./routes/inventory'),
	opname = require('./routes/opname'),
	city = require('./routes/city'),
	province = require('./routes/province'),
	users_group = require('./routes/users_group'),
	users = require('./routes/users');

app.set('port', config.web.port);
app.set('host', config.web.host);

var hbsHelpers = hbs.create({
	helpers: helpers.helpers,
	extname:'hbs',
	defaultLayout:'main',
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
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

app.use( bodyParser.json() );
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

var sauth;


app.all('/*', function(req, res, next){
	if (/\/login/.test(req.path) === false) {
		helpers.helpers.__check_permission(req, res);
	}
	next();
});

app.get('/', index.main);

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

app.get('/customers', customers.list);
app.get('/customers/customers_add', customers.add);
app.post('/customers/customers_add', customers.customers_add);
app.get('/customers/customers_update/:id', customers.customers_detail);
app.post('/customers/customers_update',customers.customers_update);
app.get('/customers/customers_delete/:id', customers.customers_delete);

app.get('/ajax/products', products.list_ajax);
app.get('/products', products.list);
app.get('/products/products_add', products.add);
app.post('/products/products_add', products.products_add);
app.get('/products/products_update/:id', products.products_detail);
app.post('/products/products_update',products.products_update);
app.get('/products/products_delete/:id', products.products_delete);

app.get('/login', login.main);
app.post('/login/logging', login.login);
app.get('/login/logout', login.logout);

app.get('/inventory', inventory.list);
app.get('/opname', opname.list);

app.get('/settings', settings.settings);
app.post('/settings/settings', settings.settings_update);

app.get('/users', users.list);
app.get('/users/users_add', users.add);
app.post('/users/users_add', users.users_add);
app.get('/users/users_update/:id', users.users_detail);
app.post('/users/users_update',users.users_update);
app.get('/users/users_delete/:id', users.users_delete);

app.get('/ajax/users_group', users_group.list_ajax);
app.get('/users_group', users_group.list);
app.get('/users_group/users_group_add', users_group.add);
app.post('/users_group/users_group_add', users_group.users_group_add);
app.get('/users_group/users_group_update/:id', users_group.users_group_detail);
app.post('/users_group/users_group_update',users_group.users_group_update);
app.get('/users_group/users_group_delete/:id', users_group.users_group_delete);

app.use(function(req, res, next){
	res.render('404', { status: 404, url: req.url });
});

http.createServer(app).listen(app.get('port'),app.get('host'), function(){
	console.log('Express server listening on host: '+app.get('host')+' port: ' + app.get('port'));
});
memcached.end();
