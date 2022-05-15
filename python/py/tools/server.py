# coding: utf-8


# 导入服务器库 
import sys
from time import sleep
from wsgiref.simple_server import make_server
from threadProcess import Thread


# 创建服务器
class WebServer:


    # 初始化
    def __init__(self):
        self.__ip = ''
        self.__port = 0
        self.__function = ''
        self.__thread = ''
        self.__thread = Thread()
        self.StatusCode = False   # 设置状态码动态关闭服务器:

    # 创建服务器
    def __server(self):
        make_server(
            self.__ip,
            self.__port,
            self.__response
        ).serve_forever()

    
    # 监听服务器
    def __monitorServer(self):
        while True:
            if self.StatusCode == True:
                self.__thread.close(False, self.__server)
                break
            sleep(1) 


    # 启动服务器
    def createServer(self, ip, port, function, monitor=False):
        self.__ip = ip
        self.__port = port
        self.__function = function
        self.__thread.start(self.__server)
        if monitor == True:
            self.__thread.start(self.__monitorServer)      
  

    
    # 关闭服务器
    def closeServer(self):
        self.__thread.close(False, self.__server)

    # 等待服务器关闭
    def joinServer(self):
        self.__thread.join()


   
    # 内部处理请求
    def __response(self,req,res):
        # 类型转换流程：JSON_DATA[type:byte] --> JSON_DATA[type:strin] --> JSON_DATA[type:dict]
        # print(req)
        getData = ''
        serveState = 0
        if req['REQUEST_METHOD'] == "POST": 
            getData = req["wsgi.input"].read(int(req.get("CONTENT_LENGTH", 0))).decode('utf-8')

        request = {
            'type': req['REQUEST_METHOD'],
            'path': req['HTTP_HOST'],
            'port': req['SERVER_PORT'],
            'info': req['PATH_INFO'],  
            'protocol': req['SERVER_PROTOCOL'],
            'browser': req['HTTP_USER_AGENT'],
            'httpType': req['wsgi.url_scheme'],
            'data': getData
        }

        response = {
            'status':'200 OK',
            'type':[('Content-Type', 'text/html') ],
            'data':'<h1>RT Hello, Python web!</h1>'

        }

        if request['type'] == "GET":
            sendResponseData = response['data'].replace('RT','GET')

        elif request['type'] == "POST":
            sendResponseData = response['data'].replace('RT','POST')

        # __function:返回数据格式: {response:{data}}
        responseData = self.__function(request)
        if responseData != None:
            if len(responseData['response']) > 0:
                response = responseData['response']
                sendResponseData = responseData['response']['data']
       
        else:
            print('''
                The handler function did not return!
                return data format:
                    response: Data returned to the client
                    _response = {
                        'status':'200 OK',
                        'type':[('Content-Type', 'text/html') ],
                        'data':'<h1>RT Hello, Python web!</h1>'
                    }
                    # return {'response':_response}
                    # return {'response':\\{\\}\\}
                    # return \\{\\} 

                ''')


        
        # 响应状态码--以及数据
        res(response['status'], response['type'])
        return [bytes(sendResponseData, encoding='utf-8')]
        
       



# # 演示示例
# def response(req):
#     global web
#     # print(req)
    
#     response = {
#         'status':'200 OK',
#         'type':[('Content-Type', 'text/html') ],
#         'data':'<h1>RT Hello, Python web!</h1>'
#     }

#     state = req['data']
#     print('state:'+ state)

    
#     if state == 'off':
#         web.StatusCode = True
    
#     return {'response':response}



# web = WebServer()

# print('开始监听端口: 8282 HTTP请求..............')
# web.createServer('127.0.0.1', 8282, response, True)
# web.joinServer()
# print(6666666)





























