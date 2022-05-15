const https = require('https');
const { memory, shell, paths, timer, file } = require('./tool')
const { setURL, wxEscape: escape } = require('./url')

const path = paths();
const jsonPath = path + '/data.json'
const jsonPaths = path + '/backup.json'
const httpsPath = path + '/../scpt/https.scpt'




const gsed = (function(){
    let [gstate,gpath,gname] = [false,'',''];

    const match = function(path,name){
        let data = false;
        [gpath,gname] = [path,name];

        if(paths(path)){
            data = shell(`gsed -n '/${name}/p' ${path}`);
            if(data.length == 0){
                console.log('读取文件数据: 没有获取到匹配的数据失败!')
                data = false;
            }else{
                console.log('读取文件数据: 获取到匹配的数据成功!')
                gstate = true;
            }

        }else{
            console.log('读取文件数据: 文件路径不存在!')  
        }

        return data;
        
    }


    match.replace = function(data){

        if (data.constructor === Array){
            // data = JSON.stringify(data).replaceAll('"',"'");
            data = JSON.stringify(data)
        }

        if(gstate){
            data = data.replaceAll('\\','\\\\')
            shell(`gsed -i '/${gname}/c ${data}' ${gpath}`)
        }else{
            // shell(`echo "${data}" >> ${gpath}`)
            file(jsonPath,data,'+');
        }
        
    }


    return match;
    
})()





/**
 * [查找数据、数据存储、数据读取]
 * @param  {Array})
 * @return {[type]}  
 */
const readFile = (function(){

    let [gstate,gname,jsonArr] = [false,'',[]];
    
    // 读取数据文件
    const read = function(name){
        gname = name;
        let data = gsed(jsonPath,`"${name}"`);
        if(data){
            gstate = true;
            jsonArr = JSON.parse(data)[0];
        }

    }

   

    // 查询标题名
    read.find = function(title){
        let state = false;
        if(gstate){
            data = jsonArr.data.find((i) => {return i.title === title;})
            if (data !== undefined) state = true;
        }

        return state;

    }




    // 存储数据文件
    read.write = function(arr){
        if(gstate !== false){
            let data = arr[0].data;
            if(data.length > 0){
                // 合并数组: 按时间大小进行排序
                jsonArr.data = jsonArr.data.concat(data);                                
                jsonArr.data = jsonArr.data.sort((a, b) => { return b.date - a.date })
        
                arr = [jsonArr]
                shell(`cp -r ${jsonPath} ${jsonPaths}`);
            }   
        }

        let len = arr[0].data.length;
        if (len > 0) gsed.replace(arr);
        console.log(`公众号: ${gname} 获取数据: ${arr[0].data.length}`)
            
            
        
    }

 

    return read;


})()












/**
 * [getJson 解析微信数据]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
const getJson = function(arr) {
    let [msg,info,msgAll] = [[],{},[]];
    let [find,url,title,date,state] = ['','','','',false]
    
    arr.forEach(function(obj){
        try { 
            
            info = obj.app_msg_ext_info;
            if(info !== undefined){

                list = info.multi_app_msg_item_list;
                date = obj.comm_msg_info.datetime;
               
                url = escape(info.content_url);
                title = escape(info.title);
                
            
                if(title.length > 0 && url.length > 0){
                    msg.push({'title':title,'date':date,'url':url});
                }
                
                if(list.length > 0){
                    list.forEach(function(i){
                        url = escape(i.content_url);
                        title = escape(i.title);
                        if(title.length > 0 && url.length > 0){
                            msg.push({'title':title,'date':date,'url':url});
                        }
                    })

                }
            }

        } catch(err) { 
            console.log('json对象解析错误! 跳过!')
            console.log(obj)
        }
            
                           
    })


    for(let i = 0; i < msg.length; i++){
        find = readFile.find(msg[i].title);
        if(find) break;
        msgAll.push(msg[i]);
    }

    if(msgAll.length == 0) find = true;

    return [{state:find},msgAll];
}


const setTime = function(time,state){
    shell(`echo "https:${state}" > ${httpsPath}`)
    time = ((new Date().getTime() - time)/1000)/60;
    console.log(`耗时: ${time.toFixed(2)}分钟`)
    console.log('已经获取到最新数据!')

}



const prefix = function(num,size,char='0') {
    let len,obj = [0,{}];
    len = ('' + num).length;
    if (len >= size) return '' + num;
    obj = (new Array(size)).join(char);
    return obj.substring(0, size - len) + num;
}



/**
 * [html 解析HTML请求https分页数据]
 * @param  {[type]} json [description]
 * @return {[type]}      [description]
 */
const html = function(json) {
    let msgURL = 'https://mp.weixin.qq.com/mp/profile_ext?action=getmsg&__biz=MzAwNjYwMjYyOA==&f=json&offset=20&count=10&is_ok=1&scene=124&uin=MjA0MzM0MjY3NA%3D%3D&key=e4dc3a6ac8fe035653631c8c8e3c93f2f2eaeb15bee41dd3bcb632729066396f73f08508ccfc1d91d2a8456c215eb5d20728e253591422b9a3c50aeeb0709e984475009d112a8167b3b06fe21cf44ec36dde8f7d2f5e2c57d41a248717494ea78d98ad17c050099d5083d42a9745183fc931ec0c8f16cbe3b52f919f62d620d7&pass_ticket=QzP1iSIen6lNLGmjXmtWdpgxioIAVX6Dt8A0lfmC51cwM1FeqKg1%2FobwbFljKFSR&wxtoken=&appmsg_token=1152_h8AVS6G8gJy5Wk3DmSrgoSMfnRb3bYDjBCgUOA~~&x5=0&f=json'
    const reg = RegExp(/操作频繁/g);
   
    if(reg.test(json.res.body)){
        shell('echo "https:err" > ' + httpsPath)
        console.log('温馨提示: 操作频繁,请稍后再试................')
        console.log('微信公众号历史请求被限制了: 需要24小时后才能使用!')

    }else{

        let time = new Date().getTime()
        let name = json.res.body.split('var nickname =')[1].split('.html(false)')[0].replaceAll('"','').replaceAll(' ','');
        let url = {'biz':json.__biz,'uin':json.uin,'key':json.key}
        readFile(name);
        console.log('读取数据成功: OK')
        console.log('\n正在获取公众号数据: ',name)


        let msgList = json.res.body.split('var msgList =')[1].split('\n')[0]
        eval('msgList = ' + escape(msgList))
        msgList = JSON.parse(msgList)
        let msgArr = getJson(msgList.list);
        let arr = [{'name':name,'size':msgArr[1].length,'data':msgArr[1]}]

        let counter = 0;

        if(msgArr[0].state){
            readFile.write(arr);
            setTime(time,'new')

        }else{ 

            let count = 0;
            timer(function(ms){
                
                if (count == 0){
                    counter++;
                    console.log(`发起请求: ${prefix(counter,3,' ')} 定时: ${prefix(ms/1000,3,' ')} 秒`)

                    msgURL = setURL(msgURL,url);
                    
                    https.get(msgURL, (res) => {
                        let [buff,msgAll,can] = ['','',''];
                        if (res.statusCode == 200 ) {  
                            res.on('data', (data) => buff += data)
                            res.on("end", () => {
                                buff = JSON.parse(buff.toString())
                                can = buff.can_msg_continue;

                                if (can == 1){
                                    msgAll = JSON.parse(buff.general_msg_list);
                                    msgArr = getJson(msgAll.list);

                                    if (msgArr[0].state == false){
                                        if (counter == 10||counter == 20||counter == 40||counter == 60||counter == 80||counter == 100||counter == 150 || counter == 200){
                                            console.log(msgArr[1][0])
                                        }
                                        arr[0].data = arr[0].data.concat(msgArr[1])
                                    }
                                }

                                if(can == undefined||can == 0||msgArr[0].state == true){
                                    count = 1;
                                    arr[0].size = arr[0].data.length;
                                    readFile.write(arr);
                                    console.log(`总共发起: ${counter} 请求!`)
                                    setTime(time,'ok')
                                   
                                }
                            })
                        }
                        
                    })
               
                }else{
                    return false;
                }

                return true;

            },1500,[2,6])

        }

    }

    
}





/**
 * [main 代理运行主函数]
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
exports.main = function(json) {
    console.log('启动网络代理: 爬取数据开始!')
    html(json)
    memory()
}




let data=[ {
        "title": "好用且能兼职赚钱的自动化工具 - Hamibot",
        "date": 1644973320,
        "url": "http://mp.weixin.qq.com/s?__biz=MzIzMzMzOTI3Nw==&mid=2247505589&idx=1&sn=c4c1623721a669e7a4c1d7f1a2795e75&chksm=e885b657dff23f413ea5e1616f8da89149bc66b6ffb8924cba1aa92f6966644b8af63f17f4da&scene=27#wechat_redirect"
    },
    {
        "title": "来了，最强 Python 学习资料（全彩打印）",
        "date": 1644886920,
        "url": "http://mp.weixin.qq.com/s?__biz=MzIzMzMzOTI3Nw==&mid=2247505578&idx=1&sn=e7be17318748f1a497b3fc19abaf8cd5&chksm=e885b648dff23f5e23af752c7539f51ad9c219491e9466fe0a8706ed622fb23f067755260ffd&scene=27#wechat_redirect"
    }]

data = JSON.stringify(data).replace('[','').replace(']','').replaceAll('/','\\/').replaceAll('&','\\\&')
// console.log(data)

let _path = "/Users/mac/Desktop/WeChat/nodejs/data/Python编程时光.json"




let name = '{"title": "用Python轻松搞定视频转 gif 动图"'
data = data + name

// shell(`gsed -i 's/${name}/${data}/' ${_path}`)
let num = shell(`gsed -n '/${name}/=' ${_path}`).replaceAll('\n','')
console.log(num.length)






// 手动格式化json文本
const gsh = function(){
    let [jsonArr,jsonAll,data] = [[],'',''];
    data = file(jsonPath);
    data = '[' + data.replaceAll('\n','').replaceAll('[{',',[{').replace(',','') +']'
    JSON.parse(data).forEach((i) => {jsonArr.push(i[0])})

    jsonArr.forEach((i) => {
        jsonAll += JSON.stringify([i]) + '\n'
    })

    file(jsonPath,jsonAll);
}

// gsh()














// file('./ms.json',[{name:'ms'}],'+');












// var num = 0;
// timer(function(ms){
//     num++;
//     console.log(ms)
//     console.log(num)
//     if(num == 10){
//         timer.stop()
//         // return false;
//     }
//     return true;
// },1500,[2,6])





