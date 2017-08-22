var settings = {}

settings.memcached = {};
settings.memcached.port = 11211;
settings.memcached.host = '127.0.0.1';
settings.memcached.options = {};

settings.web = {};
settings.debug = {};

settings.mysql = {};
settings.mysql.host = '127.0.0.1';
settings.mysql.user = 'gratcy';
settings.mysql.password = 'palma';
settings.mysql.db = 'mainan_db';

settings.web.host = "0.0.0.0";
settings.web.port = 3000;
settings.web.url = 'http://192.168.2.27:3000/';

module.exports = settings;
