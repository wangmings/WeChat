# coding: utf-8
# import tools.tool

from tools import File, Path, Shell, Eval
from tools import WebServer, Thread, sleep

chromPath = '/Users/mac/Desktop/WeChat/python/scpt/chrome.scpt'


# 微信公众号爬虫类
class WXReptile:

    def __init__(self):
        self.windowsId = 0
        self.chromNum = 0
        self.threads = Thread()
        self.web = WebServer()


    # 服务器监听获取爬到的数据
    def response(self,req):
        send = Eval(req['data'])
        self.windowsId = int(send['id'])
        
        response = {
            'status': '200 OK',
            'type': [('Content-Type', 'text/html')],
            'data': '<h1>RT Hello, Python web!</h1>'
        }

        if len(send['data']) > 2:
            print('写入爬虫数据')
            File('./data.txt',str(send['data']),'+')

        return {'response': response}



    # 监听服务器获取到的窗口
    def monitor(self):
        stopChrom = 0
        
        print('线程监听开启')
        while True:
            
            if stopChrom == self.chromNum: 
                self.web.closeServer()
                Shell('osascript -e "quit application \\"Google Chrome\\""')
                break
               
            if self.windowsId > 0:
                print('关闭游览器窗口: %d' %(self.windowsId))
                Shell(['osascript', chromPath, str(self.windowsId)])
                stopChrom += 1
                self.windowsId = 0

            sleep(1) 


    # 启动微信爬虫
    def start(self):
        self.chromNum = chrom = int(Shell(['osascript',chromPath]).replace('\n',''))

        if chrom > 0:
            print('微信爬虫: 监听端口: 8282 等待HTTP请求中..............')
            self.web.createServer('127.0.0.1', 8282, self.response)
            self.threads.start(self.monitor)
            self.threads.alive()






if __name__ == '__main__':
    wx = WXReptile()
    wx.start()





























