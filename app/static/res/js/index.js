function add_http_btn_click() {
	$('form input').attr("disabled","disabled");

	var url = $('#new_http_url').val() || '';
	
	var email = $('#new_email').val() || '';
	
	if (url == '') {
		alert('Http Url地址不能为空！');
		return ;
	}

	var server_info = {};
	server_info['type'] = 'http';
	server_info['host'] = url;
	server_info['port'] = '80';
	server_info['email'] = email;
	server_info['time'] = new Date().Format("yyyy-MM-dd hh:mm:ss");
	server_info['timestamp'] = Date.parse(new Date());
	
	var key = 'server_' + _server_md5(server_info);
	simpleStorage.set(key, server_info, 0);
	server_servers.push(server_info);
	sort_server_server();
	
	add_onerow_2_table(server_info);
	$('form')[1].reset();

	$('form input').removeAttr("disabled");
}

function add_demo_http_btn_click() {
	$('#new_http_url').val('http://www.atool.org/');
	$('#new_http_email').val('不提醒');
	add_http_btn_click();
}


function add_demo_redis_btn_click() {
	$('#new_host').val('10.246.13.189');
	$('#new_port').val(6379);
	$('#new_password').val('');
	$('#new_email').val('不提醒');
	add_redis_btn_click();
}

function ping_redis(host, port, password, email) {
//	loading.show();
	$('form input').attr("disabled","disabled");  
	var ajax = $.ajax({
		type: "POST",
		url: '/redis_ping.json',
		data: {'host': host, 'port': port, 'password': password},
		success: function(data) {
			if (data.success == 1) {
				var redis_info = {};
				redis_info['type'] = 'redis';
				redis_info['host'] = host;
				redis_info['port'] = port;
				redis_info['password'] = password;
				redis_info['email'] = email;
				redis_info['time'] = new Date().Format("yyyy-MM-dd hh:mm:ss");
				redis_info['timestamp'] = Date.parse(new Date());
				
				var key = 'server_' + _server_md5(redis_info);
				simpleStorage.set(key, redis_info, 0);
				server_servers.push(redis_info);
				sort_server_server();
				
				add_onerow_2_table(redis_info);
				$('form')[0].reset();
				$('form input').removeAttr("disabled");
//				loading.hide();
			}
			else {
//				loading.hide();
				$('form input').removeAttr("disabled");
				alert(data.data);
			}
		}, 
		dataType: 'json',
		async: true,
	});
}


//点击添加按钮
function add_redis_btn_click() {
	var host = $('#new_host').val() || '';
	var port = Number($('#new_port').val()) || 6379;
	var password = $('#new_password').val() || '';
	
	var email = $('#new_email').val() || '';
	
	if (host == '') {
		alert('redis 主机IP不能为空！');
		return ;
	}
	
	ping_redis(host, port, password, email);
}

//删除server
function del_server_btn_click(server_md5) {
	var server_key = 'server_' + server_md5
	simpleStorage.deleteKey(server_key);
	$('#' + server_md5).remove();
} 


//清空table信息
function _flush_table() {
	$('#server_table tbody td').remove();
}

//添加一行server信息
function add_onerow_2_table(server) {
	var table = $('#server_table tbody tr:nth(0)');
	var md5_key = _server_md5(server);
	//删除已经存在的tr
	$('#' + md5_key).remove();
	var html = '<tr id="'+md5_key+'"><td bgcolor="#FFFFCC">' +server['type']+ '</td><td bgcolor="#FFFFCC"><a href="/'+server['type']+'/'+ md5_key +'.html">' + server['host'] + ':' + server['port'] + '    alert to ' + (server['email'] || 'nobody') + '</a></td><td bgcolor="#FFFFCC">'+server['time']+'</td><td><input type="button" value="删除" onclick="del_server_btn_click(\''+ md5_key +'\')" /></td></tr>';
	table.after(html);
}

//填充table信息
function fill_server_table() {
	_flush_table();
	var server = null;
	for (var i in server_servers) {
		server = server_servers[i];
		add_onerow_2_table(server);
	}
}
load_all_server_from_storage();
fill_server_table();