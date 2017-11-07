// Config

var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    buckets = 9,
    colors = ["#ffffff","#ffffd9","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    times = Array.apply(null, {length: 52}).map(Number.call, function (i) { return i + 1; }), // [1, 2, ..., 52]
    gridSize = Math.floor(width / times.length),
    legendElementWidth = gridSize * 2,
    datasets = ["data/git-commit-frequency.json"];

// Config - Runtime

var numWeeksToShow = 52;

function recalculateConfig() {
    gridSize = Math.floor(width / times.length);
    legendElementWidth = 37;
}

// Runtime variables

var weeksInMilliseconds;

// Formatters

var getMonth = d3.time.format('%b');
var getMonthAndYear = d3.time.format('%b\n%Y');

Date.prototype.getWeekNumber = function () {
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

// Draw

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function resetSvg() {
  document.getElementsByTagName("svg")[0].remove();
  svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function setDayLabels() {
  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return "dayLabel mono axis"; });
}

function setTimeLabels() {
  var prevDate;
  var timeLabels = svg.selectAll(".timeLabel")
    .data(weeksInMilliseconds)
    .enter().append("text")
      .text(function(d, i) {
        if (i === 0) {
          // First week
          prevDate = new Date(d);
          return getMonthAndYear(prevDate);
        }
        if (prevDate.getMonth() === new Date(d).getMonth()) {
          // Repeated month
          return "";
        }
        prevDate = new Date(d);
        if (prevDate.getMonth() === 0) {
          // New year
          return getMonthAndYear(prevDate);
        }
        return getMonth(prevDate);
      })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return "timeLabel mono axis"; });
}

var heatmapChart = function(jsonFile) {
  d3.json(jsonFile,
  function(jsonData) {
    /* Start */
    weeksInMilliseconds = jsonData.map(d => d.week * 1000);
    var data = [];
    for (var week = 0; week < numWeeksToShow; week++) {
      for (var day = 0; day < days.length; day++) {
        data.push({
          day: day + 1,
          hour: week + 1,
          value: jsonData[week].days[day],
          date: new Date(weeksInMilliseconds[week] + day * 86400000)
        });
      }
    };
    var offset = data[0].date.getWeekNumber();
    times = Array.apply(null, {length: numWeeksToShow}).map(Number.call, function (i) {
      var actualWeek = (i + offset) % (52 + 1);
      return actualWeek + (actualWeek < offset ? 1 : 0);
    });
    recalculateConfig();
    setDayLabels();
    setTimeLabels();
    var colorScale = d3.scale.ordinal()
        .domain([0, 1, 2, 3, 4, 5, 6, 7])
        .range(colors);
    /* End */

    var cards = svg.selectAll(".hour")
        .data(data, function(d) {return d.day+':'+d.hour;});

    // cards.append("title");

    cards.enter().append("rect")
        /* Start */
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        /* End */
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

    cards.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.value); });

    // cards.select("title").text(function(d) { return d.value; });

    cards.exit().remove();

    var legend = svg.selectAll(".legend")
        .data(colorScale.domain(), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", legendElementWidth)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * (i + 0.4); })
      .attr("y", height + legendElementWidth * 1.5);

    legend.exit().remove();

  });
};

// Run

numWeeksToShow = 25;
heatmapChart(datasets[0]);

// Runtime

document.getElementById("show-all-weeks").onclick = function (e) {
  resetSvg();
  numWeeksToShow = this.checked ? 52 : 25;
  heatmapChart(datasets[0]);
}

// Tooltip

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return d.value + " commits · " + d.date.toDateString();
  });

svg.call(tip);
