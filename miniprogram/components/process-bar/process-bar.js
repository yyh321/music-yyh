// components/process-bar/process-bar.js

let movableAreaWidth = 0
let movableViewWidth = 0
let currentSec = -1 // 当前的秒数
let duration = 0 //当前歌曲总时长
let isMoving = false //当前进度条是否在拖拽,解决进度条拖动和onTimeUpdate事件有冲突的问题
let backgroundAudioManager = wx.getBackgroundAudioManager()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0
  },
  // 组件声明周期
  lifetimes: {
    ready() {
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        // 说明是同一首
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // touch: 拖动 '':setData，官方文档有介绍
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      // 当change时间触发完成后再设置值，否则影响性能，卡顿
      const curTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${curTimeFmt.min}:${curTimeFmt.sec}`
      })

      // 设置歌曲到指定时间上
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      // 此时停止拖动了
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width

      })
    },

    // 播放器事件
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        // 小程序有个坑,在onTouchEnd里有时候还会触发onchange事件，isMoving=true,导致进度条一直得不到更新,所以在这里也有重新设置一下isMoving
        isMoving = false

        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        
      })

      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {

      })

      backgroundAudioManager.onCanplay(() => {
        // 小程序在此处有个坑，有时候会是undefined，处理方法如下
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          // 如果为undefined，等1秒再设置，可以解决此问题，经验试出来的
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const currentTimeFmt = this._dateFormat(currentTime)

          // 优化处理，每一秒更改设置一次即可，因为一秒内，时间会更改4次，太频繁，影响性能
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            })

            currentSec = sec

            // 联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }
        }

      })

      backgroundAudioManager.onEnded(() => {
        // 组件内部发出一个事件，由父元素调用,调用方式跟系统事件类似，只是名字换成自定义名而已,bind:musicEnd="xxxx",musicEnd为自定义事件名
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        wx.showToast({
          title: '错误: ' + res.errCode,
        })
      })
    },

    _setTime() {
      duration = backgroundAudioManager.duration
      const formatTimeObj = this._dateFormat(duration)

      // 为对象的某个属性赋值，用[]方式
      this.setData({
        ['showTime.totalTime']: `${formatTimeObj.min}:${formatTimeObj.sec}`
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
      return time < 10 ? '0' + time : time
    }
  }
})