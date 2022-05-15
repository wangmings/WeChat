

const Box = class {
    static nShow = 1;

    constructor(color) {
        Box.nShow++;
        this.color = color;
        this.type="corcle";
        this.name = "Box";

    }


    func(name){
        console.log(name)
    }

    hello() {
        console.log('hello 88' + this);
        console.log('hello ',Box.nShow);
        // console.log('hello ',this.obj);
        this.func('title')
        // return this._a =;
    }


    static fn() {
        console.log('static');
    };
}

// var circle = new Box("hello").hello();
// var circle2 = new Box("hello2").hello('12');
// Box.fn();
// console.log(Box.nShow)
// circle.hello()


const obj = (_this,_obj) => { Object.assign(_this,_obj) }



const timer = class {

    constructor() {
        obj(this, {
            count:0, index:0, timing:0, timeAll:[],
            state:true, types:false, sleep:this.sleep,
            setTime:setTimeout,
        }); 
    }

    
    randomTimer(ms,arr){
        arr.sort((a,b) => {return a - b })
        for(let i = arr[0]; i <= arr[1]; i++) this.timeAll.push(i * ms)
    }

    sleep(func,ms,arr=[]){
        let _this = this;
        if(this.count == 0){
            this.count = 1;
            console.log('哈哈我执行了')
            if(arr.constructor === Array) this.types = true;
            if(this.types) if(arr.length == 1 || arr.length > 2 ) throw new Error('定义的数组长度不等于2或者不为[]了')
            if(this.types && arr.length == 2) this.randomTimer(ms,arr)
            if(this.types && arr.length == 0) this.timing = ms;
        }

        if(this.types && arr.length == 2){
            this.index = Math.floor((Math.random()*this.timeAll.length)); 
            this.timing = this.timeAll[this.index]
        }


        this.setTime(function(){
            obj(this,_this);
            console.log(this)
            if(func(this.timing,this.timeAll) == true && this.state == true) {
                this.sleep(func,ms,arr);
            }
        }, this.timing);

    }

    stop(){
        if(this.count == 1) this.state = false;
    }
   
}



let ms = new timer();
var num = 0;
// ms.sleep(function(ms){
//     num++;
//     // console.log(this)
//     console.log('王明',num)
//     if(num == 1){
//         // timer.stop()
//         return false;
//     }
//     return true;
// },1000)

// let numx = num;
// let msx = new timer();
// msx.sleep(function(ms){
//     numx++;
//     console.log('星号',numx)
//     // console.log(numx)
//     if(numx == 10){
//         // timer.stop()
//         return false;
//     }
//     return true;
// },1000)






class Student {
    constructor(name) {
        this.name = name;
    }

    hello() {
        console.log('Hello, ' + this.name + '!');
    }
}
class PrimaryStudent extends Student {
    constructor(name, grade) {
        super(name); // 记得用super调用父类的构造方法!
        this.grade = grade;
    }

    myGrade() {
        alert('I am at grade ' + this.grade);
    }
}

let na = new PrimaryStudent('休眠',12)
na.hello = function(){
    console.log('王明')
}
// na.hello()
// console.log(na.hello())




const msc = function(){
    let ma;
    const ma.hellox = function(){
        console.log('hellox')
    }


    return ma;
}


let ss = msc();
ss.hellox = function(){
    console.log('ss')
}


// console.log()
















