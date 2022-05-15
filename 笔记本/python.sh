# Python 项目依赖包 第三方库 生成requirements.txt

# 导出所有安装的依赖
pip freeze > requirements.txt

# 安装
pip install pipreqs

# 导出当前项目是需要的依赖
pipreqs . --encoding=utf8 --force


# 安装依赖
pip install -r requirements.txt