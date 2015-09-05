var intervalTime = 3000; //监控频率
var is_start = true; //已经开始监控

function monitor_task() {
	if (is_start) {
		get_server_data();
    }
	else {
		setTimeout(monitor_task, intervalTime);
	}
}

function sec_2_hour(sec) {
	var h = parseInt(sec / 3600);
	var m = parseInt((sec - h * 3600) / 60)
	var s = sec - h * 3600 - m * 60;
	return h + ':' + m + ':' + s;
}

function fill_data_table(data) {
	var keys = ['status_code', 'http_length', 'encoding', 'connection', 'server']
	var key = null;
	for (var i in keys) {
		key = keys[i];
		$('#' + key).text(data[key]);
	}
	
	//遍历key中以db开头的，标示不同的数据库
	var html = "";
	for (var key in data) {
		if (key.substring(0, 2) == 'db') {
			html = html + '<tr class="rb_td"><td colspan="2">'+key+'</td><td colspan="2">'+data[key].keys+'</td><td colspan="2">'+data[key].expires+'</td><td colspan="2">'+data[key].avg_ttl+'</td></tr>';
		}
	}
	//删除已有的，append新增的
	$('tr.rb_td').remove();
	$('#data_table tbody').append(html);
}

function do_server_status(data) {
	var x_date = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
	if (data.success == 1) {
		fill_data_table(data.data);
		//update charts
		timechart.addData([
		   [
              0,        // 系列索引
              data.data.get_time * 1000,
              false,
              false,
              x_date
           ]
        ]);
	}
	else {
		//填充空的数据
		timechart.addData([[0, 30000, false, false, x_date]])
	}
	setTimeout(monitor_task, intervalTime);
}

function get_server_data() {
	var ajax = $.ajax({
		type: "POST",
		url: '/server_information.json',
		timeout: 5000,
		data: {'type': server_info['type'], 'host': server_info['host'], 'port': server_info['port'], 'password': server_info['password']},
		success: do_server_status, 
		dataType: 'json',
		async: true,
	});
}


//line图
function get_line_option(text, subtext, legend, yAxis_name, y_format) {
	option = {
	    title : {
	        text: text,
	        subtext: subtext
	    },
	    tooltip : {
	        trigger: 'axis'
	    },
	    legend: {
	        data:legend
	    },
	    toolbox: {
	        show : true,
	        feature : {
	            mark : {show: true},
	            dataView : {show: true, readOnly: false},
	            magicType : {show: true, type: ['line', 'bar']},
	            restore : {show: true},
	            saveAsImage : {show: true}
	        }
	    },
	    dataZoom : {
	        show : false,
	        start : 0,
	        end : 100
	    },
	    xAxis : [{
            type : 'category',
            boundaryGap : true,
            data : (function (){
                var now = new Date();
                var res = [];
                var len = 100;
                while (len--) {
                    res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                    now = new Date(now - 2000);
                }
                return res;
            })()
	    }],
	    yAxis : [{
            type : 'value',
            scale: true,
            name : yAxis_name,
            axisLabel : {
                formatter: '{value} ' + y_format
            }
        }],
	    series : []
	};
	var tmp = null;
	var s = null;
	for (var i in legend) {
		tmp = legend[i];
		s = {
            name:tmp,
            type:'line',
            data:(function (){
                var res = [];
                var len = 100;
                while (len--) {
                    res.push(0.0);
                }
                return res;
            })()
        }
		option.series.push(s);
	}
	return option;
}

//###########################
var server_info;

function get_server_key() {
	var server_md5 = $('#wrapper').attr('server_md5');
	server_md5 = "server_" + server_md5;
	return server_md5;
}

function fill_page(key) {
	server_info = get_server(key);
	if (server_info) {
		$('.server_host_port').text(server_info['host'] + ':' + server_info['port']);
		
		//添加其他redis信息
		$('#other_server li').remove();
		var server = null;
		var html = '';
		for (var i in server_servers) {
			server = server_servers[i];
			html = '<li><a target="_blank" href="/'+server['type']+'/'+_server_md5(server)+'.html">'+ server['host'] + ':' + server['port'] +'</a></li>';
			$('#other_server').append(html);
		}
	}
	else {
		$('#wrapper').html('<h1>不存在这个Server实例。</h1>')
	}
}
//###########################


var echarts = null;

var timechart = null;
require.config({
    paths: {
        echarts: '/static/res/lib/echarts/'
    }
});
// 按需加载
require([
        'echarts',
        'echarts/chart/line',
        'echarts/chart/bar',
    ],
    function(ec) {
		echarts = ec;
		
		timechart = draw_chart('time_chart', get_line_option('Http Server实时联通情况', '', ['连接耗时'], '时间', 'ms'));
		//开启监控
		load_all_server_from_storage(); //加载本地数据
		fill_page(get_server_key());
		monitor_task();
    }
);
function draw_chart(e_id, option) {
	var eChart = echarts.init(document.getElementById(e_id));
	eChart.setOption(option);
	return eChart
}

