
-- run自调用函数: 获取从命令行输入的参数
on run argv
    set arg_len to 0
    set arg_len to (count of argv)
    
    -- 获取当前执行脚本的父文件夹路径: 
    set UnixPath to POSIX path of ((path to me as text) & "::")
    --定义局部变量: 拼接路径
    set jsPath to UnixPath & "../js/scrollControl.js"
    set urlPath to UnixPath & "../js/url.txt"


    if arg_len = 1 then
        set _id to item 1 of argv
        closeChromeWindowFun(_id)
    else
        mainChromeFun(jsPath,urlPath)
    end if

end run

-- set UnixPath to POSIX path of ((path to me as text) & "::")




-- 定义函数:关闭游览器窗口
on closeChromeWindowFun(windowsId)                                  
    tell application "Google Chrome"
        close window id windowsId
    end tell
end closeChromeWindowFun




-- 定义函数:读取文件
on readFileFun(fliePath, readType)    
    set FileData to do shell script "cat "&fliePath 
    if readType is equal to "list" then
        set FileData to paragraphs of (FileData)
    end if
    return FileData
end readFileFun







-- 定义函数:打开游览器
on openChromeFun(_url, _js)
    tell application "Google Chrome"
        set windowsAll to every window
        set _window to make new window
        set _id to id of _window
        set JS to "const windowId = "&_id&";"&_js&"; Object.values({'data':'js: executed successfully'})"
        
        tell _window
            set _num to 0
            set _wait to 4

            repeat with i from 1 to _wait
                set _num to _num + 1
                set URL of active tab of _window to _url
                delay 1
                set _name to name of _window
                if _name is equal to "新标签页" then
                    set _n to 0
                else if _name is equal to "验证" then
                    set _n to 1
                else
                    exit repeat
                end if
            end repeat


            tell active tab
                if _num = _wait then
                    close _window
                    set err to "err: Network delay, unable to load webpage!"
                    -- log err
                    return 0
            
                else
                    delay 1
                    set js to execute javascript JS
                    -- log js
                    return 1
                end if
                                
            end tell
        end tell
    end tell

end openChromeFun




-- 定义函数:打开游览器初始化
on initChromeFun()
    quit application "Google Chrome"
    delay 1
    set userAgent to "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) MicroMessenger/6.8.0(0x16080000) MacWechat/3.2.2(0x13020210) Chrome/39.0.2171.95 Safari/537.36 NetType/WIFI WindowsWechat'"                                      
    do shell script "open -n /Applications/Google\\ Chrome.app --args -user-agent="&userAgent
    delay 1
    tell application "Google Chrome"
        set windowsAll to every window
        close item 1 of windowsAll
    end tell
end initChromeFun





-- 定义函数:获取数据并处理
on mainChromeFun(jsPath,urlPath)
    initChromeFun()
    set nums to 0
    set jsData to readFileFun(jsPath,"")                      --定义变量:读取文件数据并赋值给变量
    set urlData to readFileFun(urlPath,"list")                --定义变量:读取文件数据并赋值给变量
    repeat with _url in urlData                               --循环输出读取文件的数据:行
        if length of _url is greater than 0 then              --判断字符串长度是否大于0
            set nums to nums + openChromeFun(_url, jsData)
            delay 1
        end if
    end repeat 
    log nums   

end mainChromeFun


















