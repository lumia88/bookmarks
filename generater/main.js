/*
* @Author: nooldey
* @Date:   2018-04-25 09:00:42
* @Last Modified by:   nooldey
* @Last Modified time: 2018-04-26 08:33:30
*/

const fs = require('fs')
const cheerio = require('cheerio')
const PATH = require('path')
const config = {
	bookmarksFile: PATH.resolve(__dirname, './bookmark/bookmarks.html'),
	mdFilePath: '../source/',
	unlessPath: ['public']
}

/* 定量 */
const html = fs.readFileSync(config.bookmarksFile)
const $ = cheerio.load(html)
const timeNow = Date.now()
const dirNameObj = {}
const separator = '=>'

/* 方法 */
const formatMsg = (target) => {
	let getBlen = function(str) {
		if (str == null) return 0;
		if (typeof str !== 'string') {
			str += ''
		}
		/* [^\x00-\xff]匹配的是双字节字符，即中文 */
		return str.replace(/[^\x00-\xff]/g, '01').length
	}
	let len = getBlen(target)
	let max = len > 30 ? len + 10 : 30;
	let template = (new Array(max)).join(' ')
	let res = target + template.substr(len, template.length)
	return res
}

const writeFile = (fileName, content, filePath) => {
	filePath = filePath || './md/';
    fileName = fileName.replace('.md','');
    let foldPath = PATH.join(__dirname, filePath)
    if (!fs.existsSync(foldPath)) {
        fs.mkdirSync(foldPath)
    }
	/* 写入 */
	let path = PATH.join(__dirname, filePath + fileName);
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
	fs.writeFile(path + '/README.md', content, function(err) {
		if (err) {
			return console.error(err)
		}
		else {
			let msg = [];
			msg.push(formatMsg(fileName) + 'Created Successfully!')
			let stat = fs.statSync(path + '/README.md')
			if (stat.isFile()) {
				msg.push('size: ' + stat.size)
			}
			console.log(msg.join(' '))
		}
	})
}

const formatDate = (time, fmt = 'yyyy-MM-dd hh:mm') => {
    // 10位时间戳格式化
    let timeStr = time + ''
    if (timeStr.length < 13) {
        time = time * (Math.pow(10, 13 - timeStr.length))
    }
    time = parseInt(time)
    if (isNaN(time)) {
        return ''
    }
    let date = new Date(time)
    let padLeftZero = (str) => {
        return ('00' + str).substr(str.length)
    }
    let doFormatDate = (date, fmt) => {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let obj = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in obj) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = obj[k] + ''
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
            }
        }
        return fmt
    }
    return doFormatDate(date, fmt)
}

/* 遍历、解析html */

// 遍历 a 标签
$('a').each(function (i, el) {
    let node = $(el)
    let nodeText = node.text()
    let nodeHref = node.attr('href')
    let nodeCreateTime = formatDate(node.attr('add_date'))
    let nodeUpdateTime = formatDate(node.attr('last_modified'))
    // 查找父目录
    let parentDT = node.parents('dt')
    let parentDirPathArr = []
    let parentDirPathStr = ''
    parentDT.each(function (j, parent) {
        let firstChild = $(parent).children().first()
        if (firstChild.is('h3')) {
            let dirName = firstChild.text()
            if (firstChild.attr('personal_toolbar_folder')) {
                dirName = timeNow
            }
            parentDirPathArr.push(dirName)
        }
    })
    parentDirPathStr = parentDirPathArr.reverse().join(separator)
    // console.log(parentDirPathStr)
    // 初始化当前目录路径
    if (!dirNameObj[parentDirPathStr]) {
        dirNameObj[parentDirPathStr] = []
    }
    dirNameObj[parentDirPathStr].push({
        text: nodeText,
        href: nodeHref,
        create_time: nodeCreateTime,
        update_time: nodeUpdateTime
    })
})

setTimeout(function () {
    let fileObj = {}
    Object.keys(dirNameObj).map(function (key) {
        let flag = false
        for (let path of config.unlessPath) {
            if (key.toLowerCase().includes(path.toLowerCase())) {
                flag = true
                break
            }
        }
        if (!flag) {
            // console.log('key', key)
            let keys = key.split(separator)
            // 递归处理
            function handle (index, elem, keys, len, obj) {
                if (!obj[elem]) {
                    obj[elem] = {
                        dir: elem,
                        child: {},
                        list: []
                    }
                }
                if (index < len - 1) {
                    let i = index + 1
                    handle(i, keys[i], keys, keys.length, obj[elem].child)
                } else if (index = len - 1) {
                    obj[elem].list =  dirNameObj[keys.join(separator)]
                }
            }
            handle(0, keys[0], keys, keys.length, fileObj)
        }
    })
    // 处理fileObj
    let childFileObj = fileObj[timeNow]['child']
    let fileContentArr = []
    Object.keys(childFileObj).map(function (key) {
        if (key) {
            let fileName = key + '.md'
            let fileContent = ''
            // 递归循环
            let count = 1
            let getSize = function (count) {
                let arr = new Array(count > 6 ? 6 : count).fill('#')
                return arr.join('') + ' '
            }
            let handle = function (obj, count) {
                if (obj['dir']) {
                    fileContent += getSize(count) + obj['dir'] + '\n\n'
                }
                // 判断list是否为空
                if (obj.list && obj.list.length) {
                    for (let [i, item] of obj.list.entries()) {
                        let createTime = item.create_time ? item.create_time + ' ' : ''
                        fileContent += createTime + '[' + item.text + '](' + item.href + ')' + '\n\n'
                    }
                }
                // 判断是否存在子节点
                if (obj.child && Object.keys(obj.child).length) {
                    for (let key of Object.keys(obj.child)) {
                        handle(obj.child[key], count + 1)
                    }
                }
            }
            handle(childFileObj[key], count)
            fileContentArr.push(fileContent)
            // 创建 md 文件
            writeFile(fileName, fileContent, config.mdFilePath)
        }
    })
    // 处理timeNow一层
    if (fileObj[timeNow].list && fileObj[timeNow].list.length) {
        let obj = fileObj[timeNow]
        let fileContent = ''
        for (let [i, item] of obj.list.entries()) {
            let createTime = item.create_time ? item.create_time + ' ' : ''
            fileContent += createTime + '[' + item.text + '](' + item.href + ')' + '\n\n'
        }
        fileContentArr.push(fileContent)
    }
    // 生成README.md
    // writeFile('README.md', fileContentArr.join(''), config.mdFilePath)
}, 3000)