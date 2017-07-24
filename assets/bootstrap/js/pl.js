(function($) {
	"use strict"

	$.fn.selectAjax = function(url,id) {
		var idnya = this;
		var res = '';
		res += '<option value=""></option>';
		$.get( url, function( data ) {
			$.each(data.data, function( key, val ) {
				console.log(val.value);
				if (id > 0 && val.id == id)
					res += "<option value='"+val.id+"' selected>"+val.value+"</option>";
				else
					res += "<option value='"+val.id+"'>"+val.value+"</option>";
			});
			idnya.append(res);
		});
	};

}(jQuery));
