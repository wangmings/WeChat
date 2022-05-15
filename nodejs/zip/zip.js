var AdmZip = require('adm-zip');
memory()
memory()
memory()
var zip = new AdmZip(__dirname + "/../data.json.zip");
var zipEntries = zip.getEntries();
console.log(zipEntries)
zipEntries.forEach(function(zipEntry) {
    if (zipEntry.isDirectory == false) {
        // console.log("------------=" + zip.readAsText("backup.json.zip/backup.json"));
        console.log("pop============" + zipEntry.entryName.toString().split("/").pop());
        if ((zipEntry.entryName.toString().split("/").pop()) == ("data.json")) {
            //     console.log("------------111="+zipEntry.toString());
            console.log('------------111')
            // console.log(zip)
            let data = zip.readAsText("data.json").split('\n');
            console.log("------------=" + data);
            memory()
            memory()
            data = null;


        }

    }

    
});

// 堆总数:5.11MB, 堆使用:4.85MB,
// 堆总数:10.92MB, 堆使用:6.51MB
// console.log('hello')

// printMemoryUsage ()
// printMemoryUsage ()
// printMemoryUsage ()



// const fs = require("fs");
// console.log(111111);
// printMemoryUsage ()
// printMemoryUsage ()
// printMemoryUsage ()
// const read = fs.createReadStream('../data.json')
// read.setEncoding('utf-8')
// read.resume();//让文件流开始'流'动起来
// read.on('data',data =>{//监听读取的数据，如果打印data就是文件的内容
//     console.log('正在读',data.split('\n').length);
//     if(data == '1221'){
//         console.log('结束')
//         read.destroy()
//     }
// })
// read.on('end', () => { //监听状态
//     console.log('文件读取结束');
//     printMemoryUsage ()
//     printMemoryUsage ()
//     printMemoryUsage ()
// })
// console.log(222222);



// memory()
// const fs = require('fs');
// const readline = require('readline');

// const rl = readline.createInterface({
//     input: fs.createReadStream('../data.json'),
//     output: process.stdout,
//     terminal: false
// });

// rl.on('line', (line) => {
//     console.log('一行：',line);
//     memory()
// });

// rl.on('', () => { //监听状态
//     console.log('文件读取结束');
//     memory()
// })










/**
 * [memory: 打印内存占用情况]
 */
function memory() {
    let [me,info] = [[],{}];
    const mb = (size) => { return (size/1024/1024).toFixed(2) + 'MB' }
    info = process.memoryUsage();
    for(let i in info) me.push(mb(info[i]))
    console.log(`RSS:${me[0]}, 堆总数:${me[1]}, 堆使用:${me[2]}, 外部:${me[3]}, 数组缓冲区:${me[4]}`);
}

// memory()















// setInterval(printMemoryUsage, 1000);