const fs = require('fs');
const JSONStream = require('JSONStream');

// memory()
// function min(data){
//     console.log(data);
//     memory()
// }

// (async () => {
//   const readable = fs.createReadStream('../data.json', {
//     encoding: 'utf8',
//     highWaterMark: 10
//   })
//   const parser = JSONStream.parse('.name');
//   readable.pipe(parser);
//   parser.on('data', min);
// })()



let num = 0;
function ms(){
 
    num++;
    console.log(num)
}

const mex = setInterval(ms, 1000);
console.log(99);
while(true){
    console.log(num)
    if(num == 10){
        clearInterval(mex);
        break;
    }
}
console.log(88);






function memory() {
    let [me,info] = [[],{}];
    const mb = (size) => { return (size/1024/1024).toFixed(2) + 'MB' }
    info = process.memoryUsage();
    for(let i in info) me.push(mb(info[i]))
    console.log(`RSS:${me[0]}, 堆总数:${me[1]}, 堆使用:${me[2]}, 外部:${me[3]}, 数组缓冲区:${me[4]}`);
}












