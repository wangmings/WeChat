/*
child_process：node的一个子进程api，可创建一个子进程用于执行命令行
shelljs： 基于node的api封装的一个shell执行插件
simple-git ：基于node的ap封装的一个git命令执行插件
*/


const fs = require('fs');
const { resolve } = require('path')
const { execSync } = require('child_process');





/**
 * [memory: 打印内存占用情况]
 * @return {[type]} [description]
 */
const memory = function() {
    let [me,info] = [[],{}];
    const mb = (size) => { return (size/1024/1024).toFixed(2) + 'MB' }
    info = process.memoryUsage();
    for(let i in info) me.push(mb(info[i]))
    console.log(`主进程内存:${me[0]}, 申请堆内存:${me[1]}, 使用堆内存:${me[2]}, 外部:${me[3]}, 数组缓冲区:${me[4]}`);
}





/**
 * [paths :获取当前路径: 给参数路径可以判断当前路径是否存在]
 * @param  {[type]} path [文件路径]
 * @return {[type]}      [description]
 */
const paths = function(path=null) {
    if (path !=null ){
        if (fs.existsSync(path)) {
            return true;
        } else {
            return false;
        }  
    }else{
        return __dirname 
    }
}



/*

判断文件或者文件夹是否存在
paths('./1.txt')

获取当前路径
paths()

 */




/**
 * shell [shell命令]
 * @param  {[cmd]}
 * @param  {Boolean}
 * @return {[type]}
 */
const shell = function(cmd, log = false) {
    if (cmd.constructor === Array) {
        let _cmd = ''
        cmd.forEach((s) => { _cmd += s +' '})
        cmd = _cmd
    }

    try{
        return execSync(cmd,{shell:'/bin/bash',maxBuffer:2048*1024,encoding:'utf-8'});
    } catch (err) {
        // console.log(`shell命令出错:\n ${cmd}`)
        console.log(err)
    }


}



/**
 * [escape shell字符转义]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
shell.escape = function(str){
    let cher = "\\ \' \" \* \? \~ \` \! \# \$ \& \| \{ \} \; \: \< \> \^ \/ \[ \] \( \)"
    cher = cher.split(' '); cher.push(' ');
    cher.forEach((c) => { str = str.replaceAll(c, '\\'+c) });
    return str;
}








/**
 * [timer定时执行]
 * @param  {arg: arr:秒:[1,3], ms:毫秒:1000, func:function} 
 * @param  {[type]}
 * @return {[type]}
 */
const timer = function(){
    
    let [index,timing,count,timeAll,types] = [0,0,0,[],false];
    
    const generate = function(ms,arr){
        arr.sort((a,b) => {return a - b })
        for(let i = arr[0]; i <= arr[1]; i++) timeAll.push(i * ms)
    }

    const sleep = function(func,ms,arr=[]){
        if(count == 0){
            count = 1;
            if(arr.constructor === Array) types = true;
            if(types) if(arr.length == 1 || arr.length > 2 ) throw new Error('定义的数组长度不等于2或者不为[]了')
            if(types && arr.length == 2) generate(ms,arr)
            if(types && arr.length == 0) timing = ms;
        }

        if(types && arr.length == 2){
            index = Math.floor((Math.random()*timeAll.length)); 
            timing = timeAll[index];
        }

        setTimeout(function(){
            if(func(timing,timeAll) == true) sleep(func,ms,arr)
        }, timing)

    }

    return sleep;

}





// var num = 0;
// timer()(function(ms){
//     num++;
//     // console.log(ms,this)
//     console.log('信息',num)
//     if(num == 10){
//         return false;
//     }
//     return true;
// },1000)



// let numx = 0;
// timer()(function(ms){
//     numx++;
//     // console.log(ms)
//     console.log('问问',numx)
//     if(numx == 10){
//         return false;
//     }
//     return true;
// },1000)









// var num = 0;
// timer()(function(ms){
//     num++;
//     console.log(ms)
//     console.log(num)
//     if(num == 10){
//         return false;
//     }
//     return true;
// },550,[2,6])







/**
 * [file 文件读写description]
 * @param  {[type]} path  [description]
 * @param  {[type]} data  [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
const file = function (path, data = null, model = null){
    if(data == null) {
        try {
            const readData = fs.readFileSync(path, 'utf8');
            if(readData.length == 0) {
                return false;
            }else{
                return readData;
            }
        } catch (err) {
            return false;
        }
        
    }else{
        let [text,RD] = ['', ''];
        if (data.constructor === Array){
            if(model == null){
                RD = {flag: 'w+'}
                text = JSON.stringify(data, null, 4)
            }else{
                RD = {flag: 'a+'}
                text = JSON.stringify(data) + '\n'
            }
        } else {
            if(model == null){
                RD = {flag: 'w+'}
            }else{
                RD = {flag: 'a+'}
            }
            
            if(typeof(data) == 'string'){
                text = data;
            }else{
                text = JSON.stringify(data).replaceAll('"','') + '\n'
                
            }
           
        }
        
        fs.writeFile(path, text, RD, err => { if (err) console.error(err) })
        
    }

}


/*
var obj = [{
    "name": "最后一个bug",
    "time": 1644480905207}]

console.log(obj)
file('./data.json',obj,'+')
*/









/**
 * [thread 多线程:伪多线程]
 * @param  {[type]}   func     [description]
 * @param  {[type]}   args     [description]
 * @param  {Function} callback [description]
 * @param  {Boolean}  bug      [description]
 * @return {[type]}            [description]
 */
const thread = function(func,args,callback=null,bug=false){
    let [pid,buffs] = [1,[]];

    const asyncState = function(func,args,pid){
        return new Promise(resolve => {
            func(args,resolve,pid); 
        })
    }


    const asyncFun = async (func,args,pid) => {
        let data = await asyncState(func,args,pid);
        if(bug) console.log(`结束线程:${pid} 数据:${data}`)
        buffs.push(data);
    }   


    const threadMonitor = function(){
        setTimeout(function(){
            if(buffs.length == args.length){
                if(bug) console.log(`所有线程结束: 获取数据: [${buffs}]`)
                if(callback != null) callback(buffs);
            }else{
                threadMonitor()
            }
        }, 500);
    }


    if (args.constructor === Array){
        threadMonitor()
        args.forEach((arg) => { 
            asyncFun(func,arg,pid++) 
        })
    }else{
        console.log(`参数必须使用数组传入`)
    }


}





/*

function counter(args,returns,pid){
    let num = 0;
    let cols = setInterval(() => {
        num++;
        console.log(`线程_${pid}: ${num}`)
        if (num == args) {
            clearInterval(cols)
            returns(pid)
        }
        
    },1000);
}

# 按参数创建线程
var args = [4,7,9,8]
thread(counter,args,function(data){
    console.log('处理所有线程 ',data)
},true)

 */






/**
 * [brackets 获取字符串中括号的字符串]
 * @param  {[type]} str    [description]
 * @param  {[type]} matchs [description]
 * @param  {Number} depth  [description]
 * @return {[type]}        [description]
 */
const brackets = function(str,matchs,depth=1){
    let [reg,reg2,regAll]= ['','',[]];
    if(matchs == "()") {reg = /\((.+)\)/g; reg2 = /\((.+?)\)/g;}
    if(matchs == "[]") {reg = /\[(.+)\]/g; reg2 = /\[(.+?)\]/g;}
    if(matchs == "{}") {reg = /\{(.+)\}/g; reg2 = /\{(.+?)\}/g;}
    if (depth == 1){
        str.match(reg); str = RegExp.$1; 
    }else{
        str.match(reg2).forEach((i)=>{ i.match(reg);regAll.push(RegExp.$1)})
        str = regAll;
    }
    return str;
}

/*
brackets(str,'()',2)
brackets(str,'[]',2)

 */


/**
 * [exports 挂载到全局]
 * @type {Object}
 */
module.exports = {
    file:file,
    shell:shell,
    paths:paths,
    timer:timer,
    thread:thread,
    memory:memory,
    brackets:brackets
}





