const https = require('https');
const { shell, paths, timer, file } = require('./tool')
const { setURL, wxEscape: escape } = require('./url')

const path = paths();
const jsonPath = path + '/data.json'
const jsonPaths = path + '/backup.json'
const httpsPath = path + '/../scpt/https.scpt'





/**
 * [查找数据、数据存储、数据读取]
 * @param  {Array})
 * @return {[type]}  
 */
const findData = (function(){

    let [jsonArr,stateR] = [[],false];

    // 查询标题名
    const find = function(name,title){
        if(stateR){
            let [obj,data,state] = ['','',false];
            obj = jsonArr.find((i) => { return i.name === name; })
            
            if (obj !== undefined){
                data = obj.data.find((i) => {return i.name === title;})
                if (data !== undefined) state = true;
            }

            return state;
            
        }else{return false;}

        
    }




    // 读取数据文件
    find.read = function(){
        let data = file(jsonPath);
        if(data == false){
            console.log('注意提示: 文件路径不存在或者文件为空!')
        }else{
            stateR = true;
            try {
                data.split('\n').forEach((arr) => {
                    if (arr.length > 0) jsonArr.push(JSON.parse(arr)[0]);
                })

            } catch(err) { 
                data = '[' + data.replaceAll('\n','').replaceAll('[{',',[{').replace(',','') +']'
                JSON.parse(data).forEach((i) => {jsonArr.push(i[0])})

                let jsonAll = '';
                jsonArr.forEach((i) => {
                    jsonAll += JSON.stringify([i]) + '\n'
                })

                file(jsonPath,jsonAll);
                
            }
        }
    }

  




    // 存储数据文件
    find.storage = function(name,arr){
        if(stateR == false){
            console.log(`公众号: ${name} 获取数据: ${arr[0].data.length}`)
            file(jsonPath,arr,'+');
        }else{

            let jsonAll = '';
            let obj = jsonArr.find((i) => { return i.name === name; })
            if(obj !== undefined){
                arr = arr[0].data;
                if(arr.length > 0){
                    /*
                        合并数组
                        按时间大小进行排序
                     */
                    obj.data = obj.data.concat(arr);                                
                    obj.data = obj.data.sort((a, b) => { return b.date - a.date })
                    
                    jsonArr.forEach((i) => {
                        jsonAll += JSON.stringify([i]) + '\n'
                    })

                    console.log('存储数据: OK')
                    console.log(`公众号: ${name} 获取数据: ${obj.data.length}`)
                    shell('cp -r '+jsonPath+' '+jsonPaths)
                    file(jsonPath,jsonAll);

                }

            }else{
                console.log(`公众号: ${name} 获取数据: ${arr[0].data.length}`)
                shell('cp -r '+jsonPath+' '+jsonPaths)
                file(jsonPath,arr,'+');

            }
        }
    }

 

    return find;


})()

// findData.read();
// findData.storage("冰河技术",[{'name':'hello','time':'time','data':[{},{}]}]);










/**
 * [getJson 解析微信数据]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
const getJson = function(name,arr) {
    let [msg,msgAll] = [[],[]];
    let [find,url,title,date,state] = ['','','','',false]
    
    arr.forEach(function(obj){
        try { 
            list = obj.app_msg_ext_info.multi_app_msg_item_list;
            url = escape(obj.app_msg_ext_info.content_url);
            title = escape(obj.app_msg_ext_info.title);
            date = obj.comm_msg_info.datetime;
            if(title.length > 0 && url.length > 0){
                msg.push({'name':title,'date':date,'url':url});
            }
            
            if(list.length > 0){
                list.forEach(function(i){
                    url = escape(i.content_url);
                    title = escape(i.title);
                    if(title.length > 0 && url.length > 0){
                        msg.push({'name':title,'date':date,'url':url});
                    }
                })

            }

        } catch(err) { 
            console.error('json对象解析错误! 跳过!')
            console.log(obj)
        }
            
                           
    })


    for(let i = 0; i < msg.length; i++){
        find = findData(name,msg[i].name);
        if(find) break;
        msgAll.push(msg[i]);
    }

    if(msgAll.length == 0) find = true;

    return [{state:find},msgAll];
}


const setTime = function(time){
    shell('echo "https:ok" > ' + httpsPath)
    time = ((new Date().getTime() - time)/1000)/60;
    console.log(`耗时: ${time.toFixed(2)}分钟`)
    console.log('已经获取到最新数据!')

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
        // console.log(json.res.body.split('<h2 class="weui_msg_title">')[1].split('</h2>')[0])    
        console.log('温馨提示: 操作频繁,请稍后再试................')
        console.log('微信公众号历史请求被限制了: 需要24小时后才能使用!')

    }else{

        let time = new Date().getTime()
        let name = json.res.body.split('var nickname =')[1].split('.html(false)')[0].replaceAll('"','').replaceAll(' ','');
        let url = {'biz':json.__biz,'uin':json.uin,'key':json.key}
        console.log('\n正在获取公众号数据: ',name)


        let msgList = json.res.body.split('var msgList =')[1].split('\n')[0]
        eval('msgList = ' + escape(msgList))
        msgList = JSON.parse(msgList)
        let msgArr = getJson(name,msgList.list);
        let arr = [{'name':name,'size':msgArr[1].length,'data':msgArr[1]}]

        let counter = 0;

        if(msgArr[0].state){
            findData.storage(name,arr);
            setTime(time)

        }else{ 

            let count = 0;
            timer(function(ms){
                
                if (count == 0){
                    counter++;
                    console.log(`发起请求: ${counter} 定时: ${ms}毫秒`)

                    msgURL = setURL(msgURL,url);
                    
                    https.get(msgURL, (res) => {
                        let [buff,msgAll] = ['',''];
                        if (res.statusCode == 200 ) {  
                            res.on('data', (data) => buff += data)
                            res.on("end", () => {
                                buff = JSON.parse(buff.toString())

                                if (buff.can_msg_continue == 1){
                                    msgAll = JSON.parse(buff.general_msg_list);
                                    msgArr = getJson(name,msgAll.list);

                                    if (msgArr[0].state == false){
                                        // if (counter == 10||counter == 20||counter == 40||counter == 60||counter == 80||counter == 100||counter == 150 || counter == 200){
                                        //     console.log(msgArr[1])
                                        // }
                                        arr[0].data = arr[0].data.concat(msgArr[1])
                                    }
                                }

                                if(buff.can_msg_continue == 0||msgArr[0].state == true){
                                    count = 1;
                                    arr[0].size = arr[0].data.length;
                                    findData.storage(name,arr);
                                    console.log(`总共发起: ${counter} 请求!`)
                                    setTime(time)
                                   
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
exports.main = function(text) {
    console.log('启动网络代理: 爬取数据开始!')
    findData.read();
    console.log('读取数据成功: OK')
    // html(text)
}























// const fs = require('fs')

// const data = fs.readFileSync('./temp.txt', 'utf8').split('\n')
// console.log(data)
// data.splice(data.length - 2, 0, 'test')
// fs.writeFileSync('./temp.txt', data.join('\n'), 'utf8')











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





