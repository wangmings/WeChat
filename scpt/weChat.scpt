use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions


-- 获取当前执行脚本的父文件夹路径: 
set UnixPath to POSIX path of ((path to me as text) & "::")
set publicPath to UnixPath & "weConfig.scpt"
set httpsPath to UnixPath & "https.scpt"
global publicPath
global httpsPath


-- 定义函数: 获取需要筛选的公众号
on wxConfig()
    set _list to {}
    set nameAll to readFileFun(publicPath, "list")
    repeat with _name in nameAll
        if length of _name > 0 then
            copy _name to the end of _list
        end if
    end repeat
    return _list
end wxConfig



-- 定义函数:读取文件
on readFileFun(fliePath, readType)    
    set FileData to do shell script "cat "&fliePath 
    if readType is equal to "list" then
        set FileData to paragraphs of (FileData)
    end if
    return FileData
end readFileFun




-- 定义函数: cliclick命令模拟鼠标点击
on mouseClick(pos)
    set x to the first item of pos + 20
    set y to the last item of pos + 16
    set _click to "/usr/local/bin/cliclick c:" & (x as text) & "," & (y as text)
    do shell script _click
end mouseClick






-- 定义函数: 获取坐标位置
on getPosXY(pos)
    tell application "System Events"
        tell pos
            return position
        end tell
    end tell
end getPosXY








-- 定义函数: 激活APP窗口
on activateWindow(appsx)
   tell application appsx 
        if appsx is equal to "WeChat" then
            set _app to "open /Applications/WeChat.app"
        else
            set _app to "open /System/Applications/Utilities/Terminal.app"
        end if
        do shell script _app
    end tell
end activateWindow










-- 定义函数: 循环迭代判断接收数据是否完毕
on getWeChatData(names)
    log "正在获取: [ "&names&" ] 数据...."
    set _second to 1200
    repeat
        set _data to do shell script "cat "&httpsPath
        if _data is equal to "https:ok" then
            exit repeat
        end if

        if _data is equal to "https:new" then
            set _second to 20
            exit repeat
        end if

        if _data is equal to "https:err" then
            word 5 of "one two three"  -- 报错
            exit repeat
        end if

        delay 1
    end repeat
    log "获取数据成功: "&names
    delay 1
    do shell script "echo 'https:on' > "&httpsPath
    log "等待"&_second&"秒后在发起请求!"
    delay _second
    log "等待时间到执行下一条...."
    activateWindow("WeChat")

end getWeChatData





-- 定义函数: 关闭窗口
on closeWindow(names)
    log "关闭窗口: "&names
    tell application "WeChat"
        close item 1 of every window
    end tell
    delay 1
    activateWindow("Terminal")
    getWeChatData(names)
    
end closeWindow







-- 定义函数: 点击公众号历史
on clickHistory(names)
    tell application "System Events"
        tell process "WeChat"
            say 55
            set exe to 0
            set _splitter to splitter group 1 of window "微信 (通讯录)"
            tell scroll area 2 of _splitter
                set _name to name of item 2 of (get entire contents)
                set _list to entire contents as list
                if names is equal to _name then
                    if length of _list = 8 then
                        tell its UI element 6
                            if description is equal to "查看历史消息" then
                                log "点击公众号历史: "&_name
                                my mouseClick(position)
                                delay 3
                                my closeWindow(names)
                                set exe to 1
                            end if
                        end tell
                    end if
                    return _name
                end if
            end tell

            say 66

            if exe = 0 then
                if _name is equal to missing value then
                    set arr to (get entire contents of UI element 7 of _splitter)
                    set _name to name of item 2 of arr
                    set _description to description of item 6 of arr
                    set _position to position of item 6 of arr
                    if names is equal to _name then
                        if _description is equal to "查看历史消息" then
                            log " "
                            log "点击公众号历史: "&_name
                            my mouseClick(_position)
                            delay 3
                            my closeWindow(names)
                        end if
                    end if
                end if

                say 12
                
                return _name
                
            end if
            
        end tell
    end tell
end clickHistory









-- 定义函数: 模拟滚动通讯录列表
on mouseScroll(num)
    tell application "System Events"
        tell process "WeChat"
            tell window "微信 (通讯录)" 
                tell scroll bar 1 of scroll area 1 of splitter group 1
                    set _value to value
                    set value to _value + num
                    set _value to value
                    -- log _value

                end tell
            end tell
        end tell
    end tell
end mouseScroll





-- 定义函数:获取微信通讯录的列表
on getWeChatList()
    tell application "System Events"
        tell process "WeChat"
            -- 获取窗口大小
            set _position to position of window 1
            set windowSize to size of window 1
            set height to item 2 of windowSize
            set posY to item 2 of _position
            set _posY to posY + 150
            -- log windowSize
            -- log height
            -- log _posY
        
            tell window "微信 (通讯录)" 
                -- set nameAll to {"公众号","雷小猴","油小猴","微信支付","贵州广电网络公司"}
                set nameAll to my wxConfig()
                tell table 1 of scroll area 1 of splitter group 1 
                    repeat with all in entire contents as list
                        if class of all as string is equal to "UI element" then
                            if image of all exists then 
                                set num to 0
                                set _name to name of static text of all as string
                                if _name contains "联系人" then
                                    exit repeat
                                end if

                                repeat with _names in nameAll
                                    if _name contains _names then
                                        exit repeat
                                    end if
                                    set num to num + 1
                                end repeat

                                if length of nameAll = num then
                                    set posXY to my getPosXY(all)
                                    set posY to item 2 of posXY

                                    if  posY > height then
                                        log "S++"
                                        my mouseScroll(0.25)
                                        delay 0.5
                                        set posXY to my getPosXY(all)
                                        set posY to item 2 of posXY
                                    
                                    end if

                                    if posY < _posY then
                                        log "S--"
                                        my mouseScroll(-0.15)
                                        delay 0.5
                                        set posXY to my getPosXY(all)
                                        set posY to item 2 of posXY
                                    end if


                                    -- log _name
                                    -- log posY

                                    delay 0.5

                                    repeat with i from 1 to 4
                                        my mouseClick(posXY)
                                        set history to my clickHistory(_name)
                                        if _name is equal to history then
                                            exit repeat
                                        else
                                            log "没有查找到: "&_name
                                        end if
                                        delay 0.5
                                    end repeat

                                end if
                            end if
                        end if

                    end repeat  
                end tell
            end tell
        end tell
    end tell

end getWeChatList






-- 定义函数: 初始化微信通讯录列表
on initWeChat()
    tell application "System Events"
        tell process "WeChat"
            tell window "微信 (通讯录)"                                          -- 告诉微信（通讯录）窗口
                
                set num to 0
                set nameAll to {}
                tell table 1 of scroll area 1 of splitter group 1           -- 告诉表 1 拆分器组 1 的滚动区域 1
                    repeat with all in entire contents as list
                        if class of all as string is equal to "UI element" then
                            if image of all exists then 
                                set num to num + 1
                                set _name to name of static text of all as string
                                copy _name to the end of nameAll
                                
                                if num = 3 then
                                    exit repeat
                                end if
                            end if
                        end if
                    end repeat
                end tell


                if length of nameAll = 3 then
                    try
                        set value of scroll bar 1 of scroll area 1 of splitter group 1 to 0
                    on error
                        log "温馨提示: 微信通讯录没有滚动条! 跳过!"
                    end try

                    set openXY to position of item 21 of (get entire contents)

                    if item 2 of nameAll contains "联系人" then
                        set offXY to position of item 26 of (get entire contents)
                        my mouseClick(offXY)
                        delay 0.5
                        my mouseClick(openXY)

                    else

                        my mouseClick(openXY)
                        set offXY to position of item 26 of (get entire contents)
                        delay 0.5
                        my mouseClick(offXY)
                        delay 0.5
                        my mouseClick(openXY)
                      

                    end if

                else

                   set openXY to position of item 21 of (get entire contents) 
                   my mouseClick(openXY)
                end if


            end tell
        end tell
    end tell
end initWeChat




-- 定义函数: 切换微信到通讯录
on weChatAddress()
    tell application "WeChat" 
        my activateWindow("WeChat")
        tell application "System Events"
            key code 19 using {command down}                --comment+2:切换到微信通讯录
        end tell
        my initWeChat()
    end tell
end weChatAddress







-- 定义函数: 打开终端启动代理
on whistle(cmd)
    activateWindow("Terminal")
    do shell script "echo 'https:on' > "&httpsPath
    tell application "Terminal" 
        tell application "System Events"
            if cmd is equal to "stop" then
                set stops to "w2 stop" 
                do shell script "killall node"
                do shell script "echo " &stops& "|pbcopy"
            else
                key code 40 using {command down}
                do shell script "echo " & cmd & "|pbcopy"
            end if
            delay 1
            key code 9 using {command down}
            key code 36 
        end tell
        
    end tell
end whistle





-- 定义主函数
on main() 
    log "启动: 微信公众号爬虫 ......."
    whistle("w2 run")
    try
        weChatAddress()
        delay 1
        getWeChatList()
        whistle("stop")
    on error
        set _data to do shell script "cat "&httpsPath
        if _data is equal to "https:err" then
            log "微信公众号历史请求被限制了: 需要24小时后才能解封!"
            say "嘤嘤嘤 被封号24小时了！"
        else
            log "Error: 重新启动微信刷新列表方能使用!"
        end if
        whistle("stop")
    end try
end main



main()








































