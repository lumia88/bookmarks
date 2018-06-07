/*
 * @Author: nooldey
 * @Date:   2018-04-18 10:56:39
 * @Last Modified by: nooldey
 * @Last Modified time: 2018-06-07 10:44:25
 */

const Nav = require('./nav')

module.exports = {
	base: '/bookmarks/',  /* 二级目录 */
	title: 'Chrome 书签',
	/* 标题 */
	description: '智能转换谷歌收藏夹导出书签',
	/* 描述 */
	// head: [
	// 	['tagName', { attrName: attrValue }, innerHTML?]
	// ],
	// dev: '0.0.0.0',
	// port: 8080,
	repo: 'https://github.com/nooldey/bookmarks',
	dest: 'public',
	// ga: '',
	serviceWorker: true,
	/* Nav */
	themeConfig: {
		nav: Nav
	}
}