const {
    mdConf,
    themeConf
  } = require('./config/')
  
  module.exports = {
    title: '超级码丁',
    description: 'Be the best version of you.',
    head: [
      ['link', { rel: 'icon', href: 'http://martin-blog-oss.oss-cn-beijing.aliyuncs.com/head.png?OSSAccessKeyId=LTAI4FpcWrdHLTxhjmxqwdTE&Expires=1573834231&Signature=G477gh2c3k%2FzSJWUoU%2BDTwjfTCQ%3D' }]
    ],
    markdown: mdConf,
    themeConfig: themeConf,
    plugins: [
      require('./my-router'),
      '@vuepress/back-to-top',
      [ 
        '@vuepress/google-analytics', { 'ga': 'UA-124601890-1' }
      ],
      [
        '@vuepress/pwa',
        {
          serviceWorker: true,
          updatePopup: {
            message: "发现页面有新内容",
            buttonText: "刷新"
          }
        }
      ],
      [
        'vuepress-plugin-comment',
        {
            choosen: 'valine', 
            options: {
              el: '#valine-vuepress-comment',
              appId: 'MpjhOarQ2u09fxpT8OWYPuUb-gzGzoHsz',
              appKey: '7cTtFJe0OXmQaFpUCyIokKqs',
              path: '<%- frontmatter.commentid || frontmatter.permalink %>'
            }
        }
      ]
    ]
  }