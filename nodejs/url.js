
/**
 * [exports 挂载到全局]
 * [函数提升的方法]
 */
module.exports = {
    urlEscape:urlEscape,
    wxEscape:wxEscape,
    setURL:setURL
}



/**
 * [URL.json特殊字符转义]
 */
function urlEscape(str, num = 1) {
    let char = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
    for(let i = 0; i < num; i++){
        str = str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return char[t] });
    }
    return str
}


/**
 * [wxEscape URL.json特殊字符转义]
 */
function wxEscape(str) {
    var char = ["&#39;", "'", "&quot;", '"', "&nbsp;", " ", "&gt;", ">", "&lt;", "<", "&yen;", "¥", "&amp;", "&"];
    for (let i = 0; i < char.length; i += 2) {
        str = str.replace(new RegExp(char[i], 'g'), char[i + 1])
    }
    return str
}




/**
 * [setURL 修改URL的参数赋值]
 */
function setURL(url,obj) {
    /*
    let offset = [10];
    let index = Math.floor((Math.random()*offset.length)); 
    let num = offset[index]
    */
   
    let num = 10;
    let myURL =  new URLSearchParams(url)

    num += parseInt(myURL.get('offset'))
    myURL.set('__biz',obj.biz)
    myURL.set('uin',obj.uin)
    myURL.set('key',obj.key)
    myURL.set('offset',num)
    return decodeURIComponent(myURL.toString())
}




/*
msg= setURL(msg,objs)
setURL(msg,objs)
*/
 





























