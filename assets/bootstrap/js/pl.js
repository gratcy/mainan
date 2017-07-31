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

	$.fn.statsAjax = function(url,id) {
		$.get( url, function( data ) {
			$('.label_stats_order').html(data.transaction.total);
			$('.stats_order').html('You have '+data.transaction.total+' order un approved');
			$('.label_stats_products').html(data.products.total);
			$('.stats_products').html('You have '+data.products.total+' new products');
		});
	};

}(jQuery));
