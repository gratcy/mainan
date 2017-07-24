$(document).ready(function(){
	$('#Country').change(function(){
		get_province();
	});

	$('#Province').change(function(){
		get_city();
	});
});
