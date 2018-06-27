require('dotenv').config();

const settings = {}

settings.memcached = {};
settings.memcached.port = process.env.MEMCACHED_PORT;
settings.memcached.host = process.env.MEMCACHED_HOST;
settings.memcached.options = {};

settings.web = {};
settings.debug = {};

settings.mysql = {};
settings.mysql.host = process.env.MYSQL_HOST;
settings.mysql.user = process.env.MYSQL_USER;
settings.mysql.password = process.env.MYSQL_PASSWORD;
settings.mysql.db = process.env.MYSQL_DATABASE;

settings.web.host = "0.0.0.0";
settings.web.port = 3000;
settings.web.url = 'http://0.0.0.0:3000/';

module.exports = settings;
