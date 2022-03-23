module.exports = {
  "title": "小码丁",
  "description": "勿在浮沙筑高台",
  "dest": "public",
  "locales": {
    '/': {
      lang: 'zh-CN'
    }
  },
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    "valineConfig": {
      "appId": 'tiJAfD7Cywta2Fk30nMyx4Wq-gzGzoHsz',
      "appKey": 'adcV3jng6iuNw0f3gVHwbpmP',
    },
    "nav": [
      {
        "text": "主页",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "时间轴",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "联系",
        "icon": "reco-message",
        "items": [
          {
            "text": "GitHub",
            "link": "https://github.com/MartinYY",
            "icon": "reco-github"
          }
        ]
      }
    ],
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "分类"
      },
      "tag": {
        "location": 3,
        "text": "标签"
      }
    },
    "logo": "/logo.png",
    "codeTheme": "tomorrow",
    "search": true,
    "searchMaxSuggestions": 10,
    "lastUpdated": "Last Updated",
    "author": "martin",
    "authorAvatar": "/avatar.png",
    "startYear": "2022"
  },
  "markdown": {
    "lineNumbers": true
  },
  plugins: [
    // 自动生成侧边栏的插件
    [
      "vuepress-plugin-auto-sidebar",
      {
        collapse: {
          open: true,
        },
      },
    ],
    [
      "dynamic-title",
      {
        // Icon 建议根据自身需求选择
        showIcon: "/favicon.ico",
        showText: "",
        hideIcon: "/failure.ico",
        hideText: "(●—●)不要走啊，再看看！",
        recoverTime: 2000,
      },
    ],
    // 复制代码功能
    [
      "vuepress-plugin-nuggets-style-copy",
      {
        copyText: "复制代码",
        tip: {
          content: "复制成功!",
        },
      },
    ]
  ]
}