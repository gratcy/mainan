var register = function(Handlebars) {
	var crypto = require('crypto');
    var helpers = {
		__implode : function(sep,arr) {
			var str = '';
			for(var i=0;i<arr.length;++i) {
				var index = parseInt(arr[i]);
				if (!isNaN(index)) {
					if (index > 0) {
						str += index + sep;
					}
				}
			}
			if (str)
				str = str.slice(0,-1);
			else
				str = 0;
			return str;
		},
		__get_transactions_type : function(id) {
			var data = ['Purchase Order','Retur Order','Receiving'];
			return data[(id-1)];
		},
		__get_transactions : function(arr) {
			var data = ['Purchase Order','Retur Order','Receiving','All'];
			var res = '';
			for(var i=0;i<arr.length;++i) res += data[arr[i]] + ' - ';
			return res.slice(0,-3);
		},
		__get_reporting_type : function(id) {
			var data = ['All','Grouping Transaction','Grouping User'];
			return data[id-1];
		},
		__get_retail : function(id,type) {
			if (type == 1)
				return (id == 1 ? 'Retail' : 'Eceran');
			else
				return (id == 1 ? 'Retail <input type="radio" checked="checked" name="retail" value="1" /> Eceran <input type="radio" name="retail" value="2" />' : 'Retail <input type="radio" name="retail" value="1" /> Eceran <input type="radio" checked="checked" name="retail" value="2" />');
		},
		__get_peti_cash_type : function(id,type) {
			if (type == 1)
				return (id == 1 ? 'Debit' : 'Credit');
			else
				return (id == 1 ? 'Debit <input type="radio" checked="checked" name="type" value="1" /> Credit <input type="radio" name="type" value="2" />' : 'Debit <input type="radio" name="type" value="1" /> Credit <input type="radio" checked="checked" name="type" value="2" />');
		},
		__strpad : function(pad, str, padLeft) {
			if (typeof str === 'undefined') return pad;
			
			if (padLeft) {
				return (pad + str).slice(-pad.length);
			}
			else {
				return (str + pad).substring(0, pad.length);
			}
		},
		__order_product_type : function(id,type) {
			var data = ['Pcs','Lusin'];
			if (type == 1) {
				return data[id];
			}
			else {
				var res = '';
				for(var i=0;i<data.length;++i) {
					if (id == i)
						res += '<option value="'+i+'" selected>'+data[i]+'</option>';
					else
						res += '<option value="'+i+'">'+data[i]+'</option>';
				}
				return res;
			}
		},
		__addZero : function (i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		},
		__get_date : function(unix_timestamp,format) {
			if (!unix_timestamp) unix_timestamp = helpers.__get_date_now();
			if (!format) format = 1;
			var today = new Date(unix_timestamp * 1000);
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!

			var yyyy = today.getFullYear();
			
			if(dd<10){
				dd='0'+dd;
			} 
			
			if(mm<10){
				mm='0'+mm;
			}
			
			if (format == 1)
				var today = dd+'/'+mm+'/'+yyyy;
			else
				var today = dd+'/'+mm+'/'+yyyy +' '+helpers.__addZero(today.getHours()) + ":" + helpers.__addZero(today.getMinutes());
				
			return today;
		},
		__global_login : function (key) {
			return sauth[key];
		},
		__parse_json : function (json,key) {
			var obj = JSON.parse(json);
			return obj[key];
		},
		__check_permission : function (perm) {
			for(var i=0;i<sauth.perms.length;++i) {
				if (sauth.perms[i].perm == perm) {
					return (sauth.perms[i].access == 1 ? true : false);
				}
			}
			return false;
		},
		__hash_password : function (password) {
			var hash = crypto.createHash('md5').update(password).digest('hex');
			var shasum = crypto.createHash('sha1').update(hash).digest('hex');
			return shasum;
		},
		__number_format : function (number, decimals, decPoint, thousandsSep) {
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
			var n = !isFinite(+number) ? 0 : +number
			var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
			var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
			var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
			var s = ''

			var toFixedFix = function (n, prec) {
				var k = Math.pow(10, prec)
				return '' + (Math.round(n * k) / k)
				.toFixed(prec)
			}

			s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
			if (s[0].length > 3) {
				s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || ''
				s[1] += new Array(prec - s[1].length + 1).join('0')
			}

			return s.join(dec)
		},
		__validate_email : function(email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},
		__get_date_now : function() {
			return Math.floor(Date.now() / 1000);
		},
		__themes_url : function(str) {
			return conf.web.url +'assets/' + str;
		},
		__site_url : function(str) {
			return conf.web.url + str;
		},
		__long2ip : function (ip) {
			if (!isFinite(ip)) {
				return false
			}
			return [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.')
		},
		compare : function(lvalue, rvalue, options) {
			if (arguments.length < 3)
				throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

			var operator = options.hash.operator || "==";

			var operators = {
				'==':       function(l,r) { return l == r; },
				'===':      function(l,r) { return l === r; },
				'!=':       function(l,r) { return l != r; },
				'<':        function(l,r) { return l < r; },
				'>':        function(l,r) { return l > r; },
				'<=':       function(l,r) { return l <= r; },
				'>=':       function(l,r) { return l >= r; },
				'typeof':   function(l,r) { return typeof l == r; }
			}

			if (!operators[operator])
				throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

			var result = operators[operator](lvalue,rvalue);

			if( result ) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		},
		__explode_string : function(str,rsplit,index) {
			if (!str) return;
			var res = str.split(rsplit);
			return res[index];
		},
		__replace_string : function(str,rep) {
			if (!str) return;
			var res = str.replace(/\*/g, " / ");
			return res;
		},
		__get_customer_type : function(ctype, type) {
			if (type == 1) {
				if (ctype == 0) return 'Seller';
				else return 'Buyer';
			}
			else {
				if (ctype === 0) return 'Seller <input type="radio" name="ctype" value="0" checked="checked" /> Buyer <input type="radio" name="ctype" value="1" />';
				else return 'Seller <input type="radio" name="ctype" value="0" /> Buyer <input type="radio" name="ctype" value="1" checked="checked" />';
			}
		},
		__set_error_msg : function(arr,sesId) {
			console.log('__msg'+sesId);
			memcached.set('__msg'+sesId, arr, 10, function (err) { });
		},
		__get_memcached_data : function(req) {
			var deferred = q.defer();
			memcached.get('__msg' + req.sessionID, function (err, rows) {
				if (err) {
					deferred.reject(err);
				}
				else {
					deferred.resolve(rows);
				}
			});
			return deferred.promise;
		},
		__get_error_msg : function(data,sesId) {
			if (data) {
				var css = data.error ? 'danger' : 'success';
				var resE = '';
				if (data.error || data.info) {
					var msg = data.error ? data.error : data.info;
					resE += '<div class="alert alert-'+css+' alert-dismissable"><i class="fa fa-'+(css == 'success' ? 'check' : 'ban')+'"></i> &nbsp; <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
					resE += msg;
					resE += '</div>';
					memcached.del('__msg'+sesId, function (err) {  });
					memcached.end();
					return resE;
				}
			}
		},
		__get_status : function(status,type) {
			if (type == 1)
				return (status == 1 ? 'Active' : 'Inactive');
			else
				return (status == 1 ? 'Active <input type="radio" checked="checked" name="status" value="1" /> Inactive <input type="radio" name="status" value="0" />' : 'Active <input type="radio" name="status" value="1" /> Inactive <input type="radio" checked="checked" name="status" value="0" />');
		},
		__get_roles : function(roles) {
			return true;
		}
	};

	if (Handlebars && typeof Handlebars.registerHelper === "function") {
		for (var prop in helpers) {
			Handlebars.registerHelper(prop, helpers[prop]);
		}
	}
	else {
		return helpers;
	}
};

module.exports.register = register;
module.exports.helpers = register(null); 
