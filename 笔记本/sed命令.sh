# 删除匹配123的行
sed '/123/d' 1.txt
# 删除空行
sed '/^$/d' 1.txt

sed '3ahello' 1.txt #向第三行后面添加hello，3表示行号

# 打印文件中的第三行内容
sed -n '3p' 1.txt 

# 逐行读取文件， 打印匹配you的行
sed -n '/you/p' 1.txt

# 在匹配行之前插入hello，如果有多行包含123，则包含123的每一行之前都会插入hello
sed '/123/ihello' 1.txt 

# 打印匹配error的行的行号
sed -n '/error/=' 1.txt

# 将中匹配abc或123的行的内容， 写入到2.txt中
sed -n '/abc\|123/w 2.txt' 1.txt

# c: 更改 更改匹配行的内容
gsed -i '/123/c\hello' 1.txt


# 将文件1.txt的第一行替换为hello
sed '1chello' 1.txt 

# 替换换行符为一行
gsed ":a;N;s/\n//g;ta" 1.txt


# macos安装sed命令
brew install gnu - sed
alias sed = gsed