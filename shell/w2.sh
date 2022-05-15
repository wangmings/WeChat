# sudo networksetup -setwebproxy "Wi-Fi" 127.0.0.1 8080
# sudo networksetup -setsecurewebproxy "Wi-Fi" 127.0.0.1 8080
# echo <password> | sudo -S networksetup -setwebproxystate 'Wi-Fi' off && sudo networksetup -setsecurewebproxystate 'Wi-Fi' off


say 12
# 命令重用
# w2(){ bash ~/mac_Shell/shell-command/w2.sh $@ }


# 密码验证
function sudoPasswd() {
    sudo -k 
    echo $1 | sudo -lS &>/dev/null
    return $?
}


# 设置密码
function SetSudoPasswd() {

    file=~/.whistle

    if [[ -f $file ]]
    then
        passwds=`cat $file`              
    else
        read -s -p "请输入sudo密码: " passwds
        echo $passwds > $file

    fi


    if (( $sum <= 3 ))
    then

        if sudoPasswd $passwds
        then
            ok=1
            # echo "密码验证成功!"
        else
            (( sum+=1 ))
            read -s -p "请输入sudo密码: " passwds
            echo $passwds > $file
            SetSudoPasswd
        fi
    else
        echo "连续三次输入密码错误!"
        exit 1;
    fi

    

}



# 启动Mac代理和whistle
function whistle() {

    ips=$ip':'$port
    SetSudoPasswd   
    
    if [[ $1 == 'start' ]]; then
        echo '启动系统代理: '$ips
        sudo networksetup -setwebproxy "Wi-Fi" $ip $port
        sudo networksetup -setsecurewebproxy "Wi-Fi" $ip $port

    else
        echo '关闭系统代理: '$ips
        sudo networksetup -setwebproxystate 'Wi-Fi' off
        sudo networksetup -setsecurewebproxystate 'Wi-Fi' off

    fi

    if [[ $1 == 'start' || $1 == 'stop' ]]; then
        echo ''
        command w2 $args

        # try catch异常处理
        # { 
        #     
        # } || { 
        #     ~/.nvm/versions/node/v16.13.2/bin/w2 $args
        # }

        
    fi
}




# 监听: SIGINT 进程终端, CTRL+C
function monitor() {
    echo ''
    whistle 'run'
}




# path=$(cd `dirname $0`; pwd)
# echo $path
# echo $@



#------------main---------------#

sum=1
args=$@

ip=127.0.0.1
if [[ $# == 3 ]]; then
    if [[ $2 == "-p" ]]; then
        port=$3
    fi
else
    port=8899
fi




if [[ $1 == 'run' ]]; then
    trap monitor SIGINT       
fi


if [[ $1 == 'start' || $1 == 'run' ]]; then
    whistle 'start'
elif [[ $1 == 'stop' ]]; then
    whistle 'stop'
fi



































