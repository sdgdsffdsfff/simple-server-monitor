#coding=utf-8
'''
Created on 2015年6月16日

@author: hzwangzhiwei
'''
from app import app
import flask
from app.utils import RequestUtil, OtherUtil
from flask.globals import request
from app.monitors.RedisMonitor import RedisMonitor
from app.monitors.HttpMonitor import HttpMonitor

@app.route('/', methods=['GET'])
def index_page():
    return flask.render_template('index_page.html')

@app.route('/redis/<server_md5>.html', methods=['GET'])
def redis_monitor_page(server_md5):
    return flask.render_template('redis_monitor_page.html', server_md5 = server_md5)

@app.route('/redis_ping.json', methods=['GET', 'POST'])
def redis_ping():
    try:
        host = RequestUtil.get_parameter(request, 'host', '')
        port = int(RequestUtil.get_parameter(request, 'port', '6379'))
        password = RequestUtil.get_parameter(request, 'password', '')
        # rst = RedisMonitor().ping(host = host, port = port, password = password)
        rst = {'success': 1, 'data': 'ping error'}
    except:
        rst = {'success': 1, 'data': 'ping error'}
    return OtherUtil.object_2_dict(rst)

@app.route('/http/<server_md5>.html', methods=['GET'])
def http_monitor_page(server_md5):
    return flask.render_template('http_monitor_page.html', server_md5 = server_md5)

@app.route('/server_information.json', methods=['GET', 'POST'])
def get_server_paramter():
    try:
        type = RequestUtil.get_parameter(request, 'type', '')
        host = RequestUtil.get_parameter(request, 'host', '1')
        port = int(RequestUtil.get_parameter(request, 'port', '6379'))
        password = RequestUtil.get_parameter(request, 'password', '')
        if type == 'http':
            rst = HttpMonitor().get_info(url = host)
        elif type == 'redis':
            rst = RedisMonitor().get_info(host = host, port = port, password = password)
        else:
            rst = {'success': 1, 'data': 0}
    except:
        rst = {'success': 0, 'data': ''}
    return OtherUtil.object_2_dict(rst)



#定义404页面
@app.errorhandler(404)
def page_not_found(error):
    return '404'

@app.errorhandler(502)
def server_502_error(error):
    return '502'

@app.route('/not_allow', methods=['GET'])
def deny(error):
    return 'You IP address is not in white list...'