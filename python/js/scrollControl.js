
// 游览器滚动控制
(function() {

    console.log("-**启动自动化操作**-");
    console.log("-**Chrome窗口ID: "+ windowId +" **-");

    // 定时一秒检测网页是否加载完毕
    var htmlState = setInterval(function() {
        
        //判断当前页面是否加载成功
        if (document.readyState == "complete") {
            console.log("---启动滚动操作----");
            clearInterval(htmlState);
            scrollControl();
        }
        

    }, 1000);




    // 控制游览器页面滚动
    function scrollControl() {

        var scrollStopData = 0;
        var scrollPositionData = -1;

        // 定时一秒执行滚动操作
        var timerScroll = setInterval(function() {
            // 获取游览器窗口滚动条位置
            var scrollPosition = document.documentElement.scrollTop;
            if (scrollPosition > scrollPositionData || scrollPosition < scrollPositionData) {
                scrollStopData = 0;
                scrollPositionData = scrollPosition;
                document.documentElement.scrollTop = scrollPosition + 1000;
                console.log("滚动容错率-: " + scrollStopData);
            } else {
                scrollStopData++;
                if (scrollStopData == 6) {
                    clearInterval(timerScroll);
                    getNodeData();
                }

                document.documentElement.scrollTop = scrollPosition + 1000;
                console.log("滚动容错率+: " + scrollStopData);
            }

        }, 1200);

    }




    // 获取HTML节点数据
    function getNodeData() {
        var dataArr = [];
        var publicName = document.querySelectorAll('.profile_nickname')[0].innerText;
        dataArr.push({ 'publicName': publicName });

        document.querySelectorAll('.weui_media_bd').forEach(
            function(node) {
                var text = node.querySelector('.weui_media_extra_info');
                var nodeData = node.querySelector('h4');
                if (nodeData != null) {
                    var data = { 'date': text.innerText, 'name': nodeData.innerText, 'url': nodeData.outerHTML.split("hrefs=\"")[1].split("\">")[0] };
                    dataArr.push(data);
                }
            }
        )

        sendData(dataArr) 

        // var fileName = publicName.replaceAll(' ', '');
        // downloadFile(dataArr, fileName + '.json');


    }



    // 发送获取的数据
    function sendData(data) {

        var url = 'http://127.0.0.1:8282';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        return (function(){
            var strData = {'id':windowId,'data':data}
            var sendData = JSON.stringify(strData);
            xhr.send(sendData);
        })()
    }



    // 把获取的数据下载到本地
    function downloadFile(data, filename) {

        // 把数据转换成字符串类型进行存储
        var strData = JSON.stringify(data);

        // 创建隐藏的可下载链接
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';

        // 字符内容转变成blob地址
        var blob = new Blob([strData]);
        eleLink.href = URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
    }




})()









