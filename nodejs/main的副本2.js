const https = require('https');
const { memory, shell, paths, timer, file,brackets } = require('./tool')
const { setURL, wxEscape: escape } = require('./url')

const path = paths();
const jsonPath = path + '/data.json'
const jsonPaths = path + '/backup.json'
const httpsPath = path + '/../scpt/https.scpt'









const jsonFile = (function(){
    let [gstate,gname,count] = [false,'',0];
    
    const find = function(name,init){
        if (init) {
            [gstate,gname,count] = [false,'',0];
        }
            
        let num = 0;
        if(count == 0) { 
            count = 1; 
            gname = name; 
            name = `"${name}"`;
        }
        
        if( paths(jsonPath) ){
            num = shell(`gsed -n '/${name}/=' ${jsonPath}`).replaceAll('\n','').length;    
            if(num) gstate = true;
        }

        return num;
    }

    
    find.splitSed = function(name,split,num){
        // gsed -n '/"最后一个bug"/p' data2.json|awk -F ',' {'print $2'}
        return shell(`gsed -n '/${name}/p' ${jsonPath}|awk -F '${split}' {'print $${num}'}`).replaceAll('\n','');
        
    }

    find.replaceSed = function(str,replace){
        // gsed -i 's/"size":430/hello/' data.json
        replace = shell.escape(replace);
        shell(`gsed -i 's/${str}/${replace}/' ${jsonPath}`);
        
    }



    find.insert = function(arr,title=null){
        if(gstate){
            let leng = arr.length;
            if(leng){
                arr = brackets(JSON.stringify(arr),'[]');
                arr += ','+ title;

                let obj = find.splitSed(gname,',',2);
                let num = parseInt(obj.split(':')[1]) + leng;
                find.replaceSed(title,arr);
                find.replaceSed(obj,`"size":${num}`);
                console.log(`公众号: ${gname} 获取最新数据: ${leng}`)
            }else{
                console.log('没有获取到最新数据')
            }
            
           
        }else{
            file(jsonPath,arr,'+');
            console.log(`公众号: ${gname} 获取所有数据: ${arr[0].data.length}`)
        }

        

    }

    return find;


})()









/**
 * [getJson 解析微信数据]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
const getJson = (function() {
    let [gnum,gstate] = [0,false];
    let public = [{'name':null,'size':0,'data':[]}]; 

    return function(name,arr){
        
        let [msg,info] = [[],{}];
        let [url,title,date,find] = ['','','','',true];

        if(gnum == 0){
            gnum = 1;
            public[0].name = name;
            if(jsonFile(name)) gstate = true; 
        }
        
        if(arr !== false){
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

                } catch (err){ 
                    console.log('json对象解析错误! 跳过!')
                    console.log(obj)
                }
                    
                                   
            })
        }




        if(gstate){

            date = 0;
            for(let i = 0; i < msg.length; i++){
                date = i;
                title = `{"title":"${msg[i].title}"`;
                find = jsonFile(title);
                if(find) break;
            }
           
            msg.splice(date,msg.length);
            jsonFile.insert(msg,title);
          
            
        }else{
            if(arr !== false){
                public[0].data = public[0].data.concat(msg);
                public[0].size = public[0].data.length;
                
            }else{
                jsonFile.insert(public);
                public[0].data = [];
                
            }


        }



        if(msg.length == 0) find = true;

        return find;
    }


})()





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
        console.log('读取数据成功: OK')
        console.log('\n正在获取公众号数据: ',name)


        let msgList = json.res.body.split('var msgList =')[1].split('\n')[0]
        eval('msgList = ' + escape(msgList))

        msgList = JSON.parse(msgList)
        let state = getJson(name,msgList.list,true);

        let counter = 0;

        if(state){
            setTime(time,'new');
        }else{ 

            let count = 0;
            timer()(function(ms){
                
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
                                    state = getJson(name,msgAll.list);

                                }else{
                                    getJson(name,false);
                                }

                                if(can == undefined||can == 0||state == true){
                                    count = 1;
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

            },1500,[3,6])

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
    // memory()
}

















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





