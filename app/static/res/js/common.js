var server_servers = []; //storeage中所有redis信息

function sort_server_server() {
	server_servers = server_servers.sort(function (a, b) {
        return a['timestamp'] - b['timestamp'];
    });
}


//md5，用于key值
function _server_md5(server) {
	return hex_md5(server['type'] + server['host'] + server['port']);
}

function _valid_server_storage(server_info) {
	if (server_info.hasOwnProperty('host') && 
			server_info.hasOwnProperty('port')) {
		return true;
	}
	return false;
}

function load_all_server_from_storage() {
	var keys = simpleStorage.index();
	var len = keys.length;
	for(var i = 0; i < len; i ++) {
		var key = keys[i];
		if (key.startWith('server_')) {
			var server_info = get_server(key);
			if (server_info) {
				server_servers.push(server_info);
			}
		}
	}
	sort_server_server();
}

function get_server(key) {
	try {
		var server_info = simpleStorage.get(key);
	    if (_valid_server_storage(server_info)) {
	    	return server_info;
	    }
	} catch(E) {
        console.log(E);
    }
	//不合法的跳过，并且从storeage中删除
    simpleStorage.deleteKey(key);
    return false;
}


String.prototype.trim = function() {　　
	return this.replace(/(^\s*)|(\s*$)/g, "");　　
}　　
String.prototype.ltrim = function() {　　
	return this.replace(/(^\s*)/g, "");　　
}　　
String.prototype.rtrim = function() {　　
	return this.replace(/(\s*$)/g, "");　　
}
String.prototype.endWith = function(str) {
	if (str == null || str == "" || this.length == 0 || str.length > this.length)
		return false;
	if (this.substring(this.length - str.length) == str)
		return true;
	else
		return false;
	return true;
}
String.prototype.startWith = function(str) {
	if (str == null || str == "" || this.length == 0 || str.length > this.length)
		return false;
	if (this.substr(0, str.length) == str)
		return true;
	else
		return false;
	return true;
}

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}