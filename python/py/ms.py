
from subprocess import Popen, PIPE, STDOUT


# 执行shell并输出
def exe_command(command):
    shell_data = ''
    process = Popen(command, stdout=PIPE, stderr=STDOUT, shell=True)
    with process.stdout:
        for line in iter(process.stdout.readline, b''):
            shell_data += line.decode()
    exitcode = process.wait()
    return shell_data

shello = exe_command('ls')
print(shello)