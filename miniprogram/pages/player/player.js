// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0
// 获取全局唯一的音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false,
    isLyricShow: false, // 当前是否显示歌词
    lyric:'',
    isSame:false, //是否是同一首
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId){
    if (musicId == app.getPlayMusicId()) {
      // 判断是否是同一首
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame) {
      // 不是同一首歌，要停止
      backgroundAudioManager.stop()
    }
    
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title:music.name
    })
    this.setData({
      picUrl:music.al.picUrl,
      isPlaying: false
    })

    wx.showLoading({
      title: '加载中',
    })
    
    app.setPlayMusicId(musicId)

    // 加载音乐
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then((res)=>{
      
      let result = JSON.parse(res.result)
      if(result.data[0].url=='null') {
        // 会员播放
        wx.showToast({
          title: '无权限播放',
        })
        return 
      }
      if(!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
      }
      
      this.setData({
        isPlaying:true
      })

      //加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric'
        }
      }).then((res) => {
        wx.hideLoading()
 
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc) {
          lyric = lrc.lyric
        }
        //设置歌词
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying(){
    if(this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }

    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if(nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  // 时间联动触发函数
  timeUpdate(event){
    // 获取组件,在组件内定义一个update方法，将时间传递过去,selectComponent是微信提供获取组件的方法
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay(){
    this.setData({
      isPlaying: true
    })
  },

  onPause(){
    this.setData({
      isPlaying: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})