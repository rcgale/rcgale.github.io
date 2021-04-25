// source: https://stackoverflow.com/a/41753511

var fillBetweenLinesPlugin = {
    afterDatasetsDraw: function (chart) {
        var ctx = chart.chart.ctx;
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];
        var datasets = chart.data.datasets;
        ctx.save();

        for (var d = 0; d < datasets.length; d++) {
            var dataset = datasets[d];
            if (dataset.fillBetweenSet == undefined) {
                continue;
            }

            // get meta for both data sets
            var meta1 = chart.getDatasetMeta(d);
            var meta2 = chart.getDatasetMeta(dataset.fillBetweenSet);

            ctx.beginPath();

            // vars for tracing
            var curr, prev;

            // trace set1 line
            for (var i = 0; i < meta1.data.length; i++) {
                curr = meta1.data[i];
                if (i === 0) {
                    ctx.moveTo(curr._view.x, curr._view.y);
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }
                if (curr._view.steppedLine === true) {
                    ctx.lineTo(curr._view.x, prev._view.y);
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }
                if (curr._view.tension === 0) {
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }

                ctx.bezierCurveTo(
                  prev._view.controlPointNextX,
                  prev._view.controlPointNextY,
                  curr._view.controlPointPreviousX,
                  curr._view.controlPointPreviousY,
                  curr._view.x,
                  curr._view.y
                );
                prev = curr;
            }


            // connect set1 to set2 then BACKWORDS trace set2 line
            for (var i = meta2.data.length - 1; i >= 0; i--) {
                curr = meta2.data[i];
                if (i === meta2.data.length - 1) {
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }
                if (curr._view.steppedLine === true) {
                    ctx.lineTo(prev._view.x, curr._view.y);
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }
                if (curr._view.tension === 0) {
                    ctx.lineTo(curr._view.x, curr._view.y);
                    prev = curr;
                    continue;
                }

                // reverse bezier
                ctx.bezierCurveTo(
                  prev._view.controlPointPreviousX,
                  prev._view.controlPointPreviousY,
                  curr._view.controlPointNextX,
                  curr._view.controlPointNextY,
                  curr._view.x,
                  curr._view.y
                );
                prev = curr;
            }

            ctx.closePath();
            ctx.fillStyle = dataset.fillBetweenColor || "rgba(0,0,0,0.1)";
            ctx.fill();
        }
    } // end afterDatasetsDraw
}; // end fillBetweenLinesPlugin

// Chart.register(fillBetweenLinesPlugin);


//
// function GenGraph(y) {
//     // function to generate the graph with chart.js
//
//     $(document).ready(function(){
//     var roomCap = 220
//     var prediction = [62, 65, 135, 145, 140, 120, 135, 189, 180, 175, 100, 25]
//     var gndTruthUpper = [75, 100, 150, 175, 150, 150, 175, 200, 175, 150, 125, 100]
//     var gndTruthLower = [50, 50, 75, 50, 25, 50, 75, 100, 125, 150, 125, 100, 75]
//
//     var data = {
//         labels: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"],
//             datasets: [{
//                 label: 'prediction',
//                 fill: false,
//                 pointRadius: 0,
//                 borderColor: 'blue',
//                 data: prediction
//             },{
//                 label: 'GTUpper',
//                 fill: false,
//                 pointRadius: 0,
//                 borderDash: [10, 10],
//                 borderColor: 'black',
//                 data: gndTruthUpper,
//                 fillBetweenSet: 2,
//                 fillBetweenColor: 'rgba(0,0,0,0.1)'
//            },{
//                 label: 'GTLower',
//                 fill: false,
//                 pointRadius: 0,
//                 borderDash: [10, 10],
//                 borderColor: 'black',
//                 data: gndTruthLower
//            }]
//        };
//        var options = {
//            scales: {
//                yAxes: [{
//                    ticks: {
//                        min: 0,
//                        max: roomCap
//                    }
//                }]
//            }
//        };
//
//        var ctx = document.getElementById("myChart").getContext("2d");
//        var myChart = new Chart(ctx, {
//            type: 'line',
//            data: data,
//            options: options
//        });
//     });
// };
//
// GenGraph();
