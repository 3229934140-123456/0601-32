export default defineAppConfig({
  pages: [
    'pages/overview/index',
    'pages/resources/index',
    'pages/alerts/index',
    'pages/inspection/index',
    'pages/reports/index',
    'pages/events/index',
    'pages/settings/index',
    'pages/resource-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165DFF',
    navigationBarTitleText: '运维监控平台',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F6F7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/overview/index',
        text: '总览'
      },
      {
        pagePath: 'pages/resources/index',
        text: '资源'
      },
      {
        pagePath: 'pages/alerts/index',
        text: '告警'
      },
      {
        pagePath: 'pages/inspection/index',
        text: '巡检'
      },
      {
        pagePath: 'pages/reports/index',
        text: '报表'
      }
    ]
  }
})
