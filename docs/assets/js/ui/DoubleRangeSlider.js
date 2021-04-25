// source: https://dev.to/mandrewcito/vuejs-double-range-slider-component-2c5a

import ZbRangeSlider from './ZbRangeSlider.js'

// call reset if needed
// newRangeSlider.reset();

let DoubleRangeSlider = Vue.component("double-range-slider", {
  props: {
    minThreshold: {
      type: Number,
      default: -100
    },
    maxThreshold: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      instance: undefined
    }
  },
  mounted: function () {
    this.instance = new ZbRangeSlider('my-slider')
    this.instance.onChange = (min, max) => this.updateValues(min, max)
  },
  destroyed: function () {

  },
  methods: {
    updateValues: function (min, max) {
      this.$emit('update:min', min)
      this.$emit('update:max', max)
    }
  },
  template: `
  <div class="content">
    <div id="my-slider" :se-min="minThreshold" :se-step="step" :se-min-value="min" :se-max-value="max" :se-max="maxThreshold" class="slider">
      <div class="slider-touch-left">
        <span></span>
      </div>
      <div class="slider-touch-right">
        <span></span>
      </div>
      <div class="slider-line">
        <span></span>
      </div>
    </div>
  </div>`
});

export default DoubleRangeSlider;