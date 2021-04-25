---
layout: post
title:  "Marginal vs. Effective Tax Rates"
date:   2021-04-24 19:18:00 -0700
categories: [government]
tags: calculus 
published: true
---

For as many of us pay taxes in a bracketed system, there's a ton of misunderstanding around how marginal tax rates work.
And it's more than an accounting detail, marginal tax rates are the primary factor in determining how much income we 
take home, not to mention how much revenue the government receives.

The misunderstanding goes like this: "If my salary jumps to $42,000 I might jump a tax bracket and take home less 
money." In short: no you won't, not ever. The tax rate listed beside your tax bracket is a _marginal_ tax rate, as 
opposed to how much tax you actually pay, which is the _effective_ tax rate.

In a few words, all the money you make before your tax bracket is taxed at those lower bracket rates. The 
misunderstanding is an easy one to make, and anti-tax politicians are happy to let people misunderstand. In one poll, 
respondents were asked to choose between a correct and incorrect explanation of marginal tax rates.
62% of Republicans and 37% of Democrats [failed to answer correctly](https://today.yougov.com/topics/politics/articles-reports/2013/01/08/understanding-how-marginal-taxes-work-its-all-part).

I'm not going to write a better explainer than one of the many already out there, but I've wondered for a while what
the rates actually look like when laid out in one continuous graph (emphasis on the continuous!). So I pulled out the 
ol' plot software today and hacked it together, using the 2019 tax brackets:

<div id="bracket-tax-app"></div>

The math behind it:

For each tax bracket, we consider the percentage $p$ of total income $I$ that is taxable under that bracket:

$$
\begin{align*}
b_l &= \text{ lower bound of bracket }
\\
b_u &= \text{ upper bound of bracket }
\\\\
p(I) &= \begin{cases} 
    \frac{b_u-b_l}{I} & \text{if } b_l < I \le b_u \text{,}\\\\
    \frac{I-b_l}{I} & \text{if } b_u < I \text{,}\\\\
    0 & \text{otherwise}
\end{cases}
\end{align*}
$$

Use that percentage to scale your income from each bracket, factoring in the tax rate $r_n$, and sum them all up.


$$
\begin{align*}
E(I)=\sum_{n=1}^{7} I \cdot r_n \cdot p(I)
\end{align*}
$$

Example: if you make $50,000, you need to consider three tax brackets:

* \\$0 - $9,951, with a 10% marginal rate 
* \\$9,951 - $40,526, with a 12% marginal rate 
* \\$40,526 - $86,376, with a 22% marginal rate 

That calculation goes like so:

$$
\begin{align*}
E(I) =&\  10\% \cdot \frac{$9,951 - $0}{$50,000} + \\
      &\  12\% \cdot \frac{$40,526 - $9,951}{$50,000} + \\ 
      &\  22\% \cdot \frac{$50,000 - $40,526}{$50,000}
\\\\
     =&\  (10\% \cdot 19.9\%) + (12\% \cdot 61.2\%) + (22\% \cdot 18.9\%)
\\\\
     =&\ 13.5\%
\end{align*}
$$

## Sigmoid tax

One motivation for wanting to make these plots is that I wanted to play around with an idea I'm calling the Sigmoid Tax.
A sigmoid is an s-shaped function, in this case based on the formula:

$$
\begin{align*}
\frac{1}{1+10^{-x}}
\end{align*}
$$

The idea would be to replace that gnarly tax bracket system with something smooth and simple. I added some parameters so
I could toy around with sliders and see how the plot compares to the bracket system. Surely I'm not the first person to
consider such a thing, but I thought it would be interesting to explore. Enjoy!

<div id="sigmoid-tax-app"></div>


$$
\begin{align*}
S(I) = b+\frac{r-b}{1+10^{\frac{-2(I-m)}{w\cdot I}}}
\end{align*}
$$

{% raw %}
<script type="module">
import DoubleRangeSlider from "/assets/js/ui/DoubleRangeSlider.js";

Vue.component('sigmoid-tax-plot', {
    props: {
        sigmoid: {
            type: Boolean,
            default: false
        },
    },
    data: function() {
        return { 
            pointsPerBracket: 25,
            brackets: [
                { n: 1, from: 0, to: 9951, rate: 10},
                { n: 2, from: 9951, to: 40526, rate: 12},
                { n: 3, from: 40526, to: 86376, rate: 22},
                { n: 4, from: 86376, to: 164926, rate: 24},
                { n: 5, from: 164926, to: 209426, rate: 32},
                { n: 6, from: 209426, to: 523601, rate: 35},
                { n: 7, from: 523601, to: Number.MAX_SAFE_INTEGER, rate: 37},
            ],
            xMin: 0,
            xMax: 1000000,

            sigM: 100000,
            sigR: 0.37,
            sigW: 4,
            sigB: 0.0,
            chart: null,
        }
    },
    computed: {
        palette() {
            let start = [255, 71, 0];
            let scale = 0.89;
            return new Array(1 + this.brackets.length).fill([255, 71, 0]).map(
                (c, i) => c.map((v) => Math.round(v * scale **i))
            ).map(
                (c) => `rgb(${c.join(", ")})`
            );
        },
        datasets() {
            let datasets = this.brackets.map((b, i) => ({
                label: this.bracketName(b),
                borderColor: this.palette[b.n],
                backgroundColor: this.palette[b.n],
                data: this.linspace(b.from, Math.min(this.xMax, b.to), this.pointsPerBracket).map(
                    (x) => ({x: x, y: this.effectiveTaxRate(x)})
                ),
                fill: false,
                pointRadius: 0,
            }));
            if (this.sigmoid) {
                datasets.push({
                    label: "Sigmoid",
                    borderColor: "#0000ff",
                    backgroundColor: "#0000ff",
                    data: this.linspace(this.xMin, this.xMax, 100).map(
                        (x) => ({
                            x: x,
                            y: 100 * (this.sigB + (this.sigR - this.sigB) / 
                                (1 + 10**(-2*(x-this.sigM)/(this.sigW*this.sigM))))
                        })
                    ),
                    fill: false,
                    pointRadius: 0,
                });
            }
            return datasets;
        },
    },
    methods: {
        effectiveTaxRate(x) {
            if (x == 0) {
                return this.brackets.find(b => b.from <= x).rate;
            }
            return this.brackets.filter(b => b.from <= x).map(
                (b) => b.rate * (Math.min(x, b.to) - b.from) / x
            ).reduce((t, v) => (t + v), 0);
        },
        bracketName(b) {
            let r = `(${this.formatRate(b.rate)} marginal)`;
            if (!b.from) {
                return `Up to ${this.formatMoney(b.to)} ${r}`;
            }
            if (!b.to || b.to === Math.max(this.brackets.map(b => b.to))) {
                return `${this.formatMoney(b.from)} and up ${r}`;
            }
            return `${this.formatMoney(b.from)} to ${this.formatMoney(b.to)} ${r}`;
        },
        formatRate(value) {
            return `${Math.round(value)}%`
        },
        formatMoney(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(value);
        },
        linspace(start, stop, num) {
            return Array.from(Array(num + 1).keys()).map(n => (
                start + (stop-start)/num * n
            ));
        },
        refreshChart() {
            this.datasets.map(
                (d, i) => this.chart.data.datasets[i] = d
            );
            this.chart.options.scales.x.min = this.xMin;
            this.chart.options.scales.x.max = this.xMax;
            this.chart.update();
        },
    },
    watch: {
        brackets(va) { this.refreshChart(); },
        sigM(val) { this.refreshChart(); },
        sigW(val) { this.refreshChart(); },
        sigR(val) { this.refreshChart(); },
        sigB(val) { this.refreshChart(); },
        xMin(val) { this.refreshChart(); },
        xMax(val) { this.refreshChart(); },
    },
    mounted() {
        this.chart = new Chart(
            this.$refs["chart-canvas"],
            {
                type: "line",
                data: {
                    labels: this.x,
                    datasets: this.datasets
                },
                options: {
                    animation: {
                        duration: 0
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: this.formatMoney
                            }
                        }
                    },
                    scales: {
                        x: { 
                            title: {
                                display: true,
                                text: "Annual Adjusted Income"
                            },
                            type: "linear",
                            min: this.xMin,
                            max: this.xMax,
                            ticks: { 
                                callback: this.formatMoney
                            }
                        },
                        y: { 
                            title: {
                                display: true,
                                text: "Effective Tax Rate"
                            },
                            min: 0,
                            ticks: { 
                                callback: this.formatRate
                            }
                        },
                    }
                }
            }
        );
    },
    template: `
        <div>
            <div class="plot-legend" >
                <div v-for="bracket, i in brackets" style="font-size: 0.8em; margin-bottom: 0.5em;">
                    <div v-bind:style="{backgroundColor: palette[i]}" style="display: inline-block; height: 100%; width: 2em;">
                        &nbsp;
                    </div>

                    <span style="font-weight: bold;">
                        <!-- (<input type="number" v-model="bracket.rate" min="0" max="1" step="0.01" />% marginal) -->
                        {{formatRate(bracket.rate)}} bracket - 
                    </span>

                    <span v-if="bracket.from && bracket.to && bracket.to < Number.MAX_SAFE_INTEGER">
                        <!-- $<input type="number" v-model="bracket.from" min="1" max="9999999" step="1"> -->
                        {{formatMoney(bracket.from)}}
                        to
                        {{formatMoney(bracket.to)}}
                        <!-- $<input type="number" v-model="bracket.to" min="1" max="9999999" step="1"> -->
                    </span>
                    <span v-if="!bracket.from">
                        Up to {{formatMoney(bracket.to)}}
                        <!-- $<input type="number" v-model="bracket.to" min="1" max="9999999" step="1"> -->
                    </span>
                    <span v-if="!bracket.to || bracket.to == Number.MAX_SAFE_INTEGER">
                        <!-- $<input type="number" v-model="bracket.from" min="1" max="9999999" step="1"> -->
                        {{formatMoney(bracket.from)}} and up
                    </span>
                </div>
            </div>
            <div style="height: 300px">
                <canvas ref="chart-canvas" style="height: 100%"></canvas>
            </div>
            <div v-if="!sigmoid">
                Adjust income range: <double-range-slider
                    :min-threshold="0"
                    :max-threshold="3000000"
                    :min="xMin"
                    :max="xMax"
                    @update:min="value => xMin = value"
                    @update:max="value => xMax = value"
                ></double-range-slider>
                <br><br>
            </div>
            <div v-if="sigmoid">
                <div>
                    <input type="range" min="0" max="3000000" step="10000" v-model="xMin" class="slider">
                    Plot minimum income:
                    $<input type="number" min="0" max="3000000" step="10000" v-model="xMin">
                </div>
                <div>
                    <input type="range" min="0" max="3000000" step="10000" v-model="xMax" class="slider">
                    Plot maximum income:
                    $<input type="number" min="0" max="3000000" step="10000" v-model="xMax">
                </div>
                <hr>
            </div>
            <div v-if="sigmoid">
                <div>
                    <input type="range" min="0" max="300000" step="10000" v-model="sigM" class="slider">
                    Sigmoid midpoint:
                    (m = $<input type="number" min="0" max="300000" step="10000" v-model="sigM">)
                </div>
                <div>
                    <input type="range" min="0.00001" max="20" step="0.1"  v-model="sigW" class="slider">
                    Sigmoid width:
                    (w = <input type="number" min="0.00001" max="20" step="0.1" v-model="sigW">)
                </div>
                <div>
                    <input type="range" min="0" max="1" step="0.001" v-model="sigR" class="slider">
                    Sigmoid maximum rate 
                    (r = <input type="number" min="0" max="1" step="0.01" v-model="sigR">)
                </div>
                <div>
                    <input type="range" min="0" max="1" step="0.001" v-model="sigB" class="slider">
                    Sigmoid minimum rate:
                    (b = <input type="number" min="0" max="1" step="0.01" v-model="sigB">)
                </div>
            </div>
        </div>
    `
});

var app = new Vue({
  el: '#bracket-tax-app',
  template: `
    <div>
        <sigmoid-tax-plot></sigmoid-tax-plot>
    </div>
  `
});

var app = new Vue({
  el: '#sigmoid-tax-app',
  template: `
    <div>
        <sigmoid-tax-plot :sigmoid="true"></sigmoid-tax-plot>
    </div>
  `
});
</script>

{% endraw %}
