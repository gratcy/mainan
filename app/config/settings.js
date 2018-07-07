require('dotenv').config();

const settings = {}
const PORT = 3000
const BASE_DOMAIN = process.env.BASE_DOMAIN || `http://0.0.0.0:${PORT}/`

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

settings.web.port = PORT;
settings.web.url = BASE_DOMAIN;

module.exports = settings;
