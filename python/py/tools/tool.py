# coding: utf-8
# 创建实用的工具类

import os, sys, ast
from pprint import pprint
from subprocess import Popen, PIPE
import bug 



# 创建数据类型转换:安全:字符串类型转换其他类型
class Eval:

    def __new__(self, string, safety=True):
        return eval(string) if safety == False else ast.literal_eval(string)



# 创建获取当前文件父路径类
class Path:
    
    def __new__(self, FileName=''):
        path = os.path.split(os.path.abspath(__file__))[0]
        if FileName != '': 
            path += '/' + FileName.replace(' ','').replace('./','')  
        return path
    
    # 获取Python包路径
    def bagPath(self):
        pprint(sys.path)    







# 创建shell脚本执行类
class Shell:

    # 参数说明：shell:comment  model: 0:等待输出 1:实时输出 realTime: 实时输出:sys模式 或者 PIPE模式 
    def __new__(self, shell, model=0, realTime='sys'):
        command = ''
        if type(shell) == list and len(shell) > 1: 
            if shell[1].replace(' ','')[0] != '/': shell[1] = Path(shell[1])
            for i in shell: command += i + ' '; shell = command
        return self.waitExecOutput(shell) if model == 0 else self.realTimeExecOutput(shell, realTime)
    
 
    # 等待执行完后输出
    def waitExecOutput(shell):        
        cmd = Popen(shell, shell=True, stdout=PIPE, stderr=PIPE)
        err = bytes(cmd.stderr.read()).decode('utf8')
        out = bytes(cmd.stdout.read()).decode('utf8')
        return out if len(err) == 0 else err

    
    # 实时执行完后输出
    def realTimeExecOutput(shell, model):
        std = [sys.stderr, sys.stdout] if model == 'sys' else [PIPE, PIPE]
       
        cmd = Popen( 
            shell, 
            stdin = PIPE, 
            stderr = std[0], 
            stdout = std[1], 
            shell = True, 
            close_fds = True, 
            universal_newlines = True,  
            bufsize = 1,
            env={"LANG": "zh_CN.UTF-8"}
        )

        if model == 'sys':
            cmd.communicate()
        else:
            while True:
                # readline可能会容易卡死
                line = cmd.stdout.readline()
                print(line, end='')
                if Popen.poll(cmd) == 0: break

        
        code = cmd.returncode
        if code == 0: code = ''
        return code
 
       

  

    


# 创建文件读写类
class File:
    
    def __new__(self, FPath, data='read', append=''):
        if FPath.replace(' ','')[0] != '/': FPath = Path(FPath)
        if data == 'list':
            return self.readFileList(FPath, 'r+')  
        elif data == 'read':
            try:
                return self.readFile(FPath, 'r+')
            except:
                return self.readFile(FPath, 'rb+')        
        else:
            if append == '+':
                model = 'ab+' if type(data) == bytes else 'a+'
            else:
                model = 'wb+' if type(data) == bytes else 'w+'
            self.writeFile(FPath, model, data)
    
    # 读取数据列表: 外部无法访问
    def readFileList(FPath, model):
        lists = []
        with open(FPath, model) as file:
            for line in file: 
                if len(line) > 1: lists.append(line.replace('\n','')) 
            return lists    
                     
    # 读取数据: 外部无法访问
    def readFile(FPath, model):
        with open(FPath, model) as file:
            return file.read()


    # 写人数据: 外部无法访问
    def writeFile(FPath, model, data):
        with open(FPath, model) as file:
            if model == 'a+': data += '\n'
            file.write(data)
        
















# -------------------------------------------------------------->>
# shell执行
# Shell('ls')
# Shell('ls',True)
# Shell(['osascript','./chrome.scpt','12'])
# Shell(['osascript','/Users/mac/chrome.scpt','12']) 
# print(Shell("ping www.baidu.com",1))  
# out = Shell(['bash','./ms.sh'],1)
# print(out)
# out = Shell(['bash','./ms.sh'],1,'')
# print(out)
  


# 字符串数据转换:安全:字符串数据不可直接可以执行
# ms = Eval('1+1',False)
# ms = Eval('[{"ms":12}]')
# print(type(ms))
# print(ms)

# 字符串数据转换:不安全:字符串数据直接可以执行
# ms = Eval('1+1',False)
# print(type(ms))
# print(ms)

# 获取父目录的路径
# p = Path('./m.txt')
# print(p)

# p = Path('a.txt')
# print(p)             

# p = Path()
# print(p)


# 文件读
# File('c.txt')
# File('./c.txt')
# File('/Users/mac/c.txt')
# File('./c.txt','list')

# 文件写数据
# File('./c.txt',data)
# File('./c.txt',data,'+')
# File.readFile('./c.txt','r')
# File.writeFile('./c.txt','w',data)



