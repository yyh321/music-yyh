// components/process-bar/process-bar.js

let movableAreaWidth = 0
let movableViewWidth = 0
let backgroundAudioManager = wx.getBackgroundAudioManager()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:'00:00',
      totalTime:'00:00',
    },
    movableDis:0,
    progress:0
  },
  // 组件声明周期
  lifetimes:{
    ready(){
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _getMovableDis(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect)=>{
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(111)
        console.log(movableAreaWidth, movableViewWidth)
      })
    },

  // 播放器事件
    _bindBGMEvent(){
      backgroundAudioManager.onPlay(() => {

      })

      backgroundAudioManager.onStop(() => {

      })

      backgroundAudioManager.onPause(() => {

      })

      backgroundAudioManager.onWaiting(() => {

      })

      backgroundAudioManager.onCanplay(() => {
        // 小程序在此处有个坑，有时候会是undefined，处理方法如下
        if(typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          // 如果为undefined，等1秒再设置，可以解决此问题，经验试出来的
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {

      })

      backgroundAudioManager.onEnded(() => {

      })

      backgroundAudioManager.onError((res) => {
        wx.showToast({
          title: '错误: ' + res.errCode,
        })
      })
    },

    _setTime() {
      const duration = backgroundAudioManager.duration
      const formatTimeObj = this._dateFormat(duration)
      
      // 为对象的某个属性赋值，用[]方式
      this.setData({
        ['showTime.totalTime']:`${formatTimeObj.min}:${formatTimeObj.sec}`
      })
    },

    _dateFormat(sec) {
      let min = Math.floor(sec / 60);
       sec = Math.floor(sec % 60)
      return {
        'min': this._parseTime(min),
        'sec': this._parseTime(sec)
      }
    },
    _parseTime(time) {
      return time < 10 ? '0'+time : time
    }
  }
})
