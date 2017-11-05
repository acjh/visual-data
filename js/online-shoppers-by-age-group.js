// Config

var groupName = "year";

// Config - d3.js

var axisLabelY = "Percentage";

// Draw

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("data/online-shoppers-by-age-group.csv", function(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  x0.domain(data.map(function(d) { return d[groupName]; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

  // Add y-axis gridlines
  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat("")
    )

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d[groupName]) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      /* Start */
      .attr("class", function(d) { return getClasses(d.key); })
      .on("mouseover", function(d) { fadeOnOthers(d.key); showTooltip(); })
      .on("mousemove", function(d) { moveTooltip(d.key, d.value); })
      .on("mouseout", function(d) { fadeOffAll(); hideTooltip(); })
      /* End */
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); });

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text(axisLabelY);

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      /* Start */
      .attr("class", getClasses)
      .on("mouseover", fadeOnOthers)
      .on("mouseout", fadeOffAll)
      /* End */
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      /* Start */
      .attr("class", getClasses)
      .on("mouseover", fadeOnOthers)
      .on("mouseout", fadeOffAll)
      /* End */
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});

// Fade - Generic

function fadeOn(selector) {
  toggleClass(selector, "fade", true);
}

function fadeOff(selector) {
  toggleClass(selector, "fade", false);
}

function toggleClass(selector, cssClass, force) {
  var nodes = document.getElementsByClassName(selector);
  for (var i = 0; i < nodes.length; i++)
  {
    nodes.item(i).classList.toggle(cssClass, force);
  }
}

// Fade - Custom

function fadeOffAll() {
  fadeOff("age-all");
}

function fadeOnOthers(key) {
  fadeOn("age-all");
  fadeOff(getAgeClass(key));
}

function getAgeClass(key) {
  return "age-" + key.replace(/\s/g, "-"); // e.g. age-60-and-above
}

function getClasses(key) {
  return "age-all" + " " + getAgeClass(key);
}

// Tooltip - Generic

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

// Tooltip - Custom

tooltip
  .style("background-color", "white")
  .style("border", "1px solid black")
  .style("border-radius", "5px")
  .style("padding", "0 2px");

function hideTooltip() {
  tooltip.style("visibility", "hidden");
}

function moveTooltip(key, value) {
  tooltip.text(key + ": " + value + "%");
  tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
}

function showTooltip() {
  tooltip.style("visibility", "visible");
}
