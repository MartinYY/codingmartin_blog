const sidebar = require('./sidebar')

module.exports = {
  repo: 'MartinYY/codingmartin_blog.git',
  navbar: true, 
  editLinks: true,
  editLinkText: '在 GitHub 上编辑此页',
  lastUpdated: '更新于',
  sidebar,
  nav: [
    { text: '导航', link: '/guide/' },
    {
      text: 'Java基础',
      items: [
        { text: '集合', link: 'passages/1.0-集合框架/' }
      ]
    },
    // {
    //   text: '了解更多',
    //   items: [
    //     { text: '友情链接', link: '/friends/' },
    //     { text: '网站信息', link: '/about/' },
    //   ]
    // }
  ]
}