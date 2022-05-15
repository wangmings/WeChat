# coding: utf-8
# Python代码调试神器
# import pysnooper

# Python格式化错误：方便定位到出问题的代码段
import pretty_errors


pretty_errors.configure(
    separator_character = '-',
    filename_display    = pretty_errors.FILENAME_EXTENDED,
    line_number_first   = True,
    display_link        = True,
    lines_before        = 5,
    lines_after         = 2,
    line_color          = pretty_errors.RED + '> ' + pretty_errors.default_config.line_color,
    code_color          = '  ' + pretty_errors.default_config.line_color,
)



# https://magic.iswbm.com/c07/c07_02.html
# 安装 python3 -m pip install pretty-errors

# header_color：     设置标题行的颜色。
# timestamp_color：  设置时间戳颜色
# default_color：    设置默认的颜色
# filename_color：   设置文件名颜色
# line_number_color：设置行号颜色。
# function_color：   设置函数颜色。
# link_color：       设置链接的颜色。


# BLACK：    黑色
# GREY：     灰色
# RED：      红色
# GREEN：    绿色
# YELLOW：   黄色
# BLUE：     蓝色
# MAGENTA：  品红色
# CYAN：     蓝绿色
# WHITE：    白色













