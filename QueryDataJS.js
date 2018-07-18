let resultItems3;
let xInput;
let xInput2 = [];
let myTitle;
let userAPI;

let svg = d3.select('svg'),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
let x1 = d3.scaleBand().padding(0.05); //keys

let y = d3.scaleLinear().rangeRound([height, 0]);
let z = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#e2ab08"]);

//Draw Function
function draw(data, state) {

    console.log("keys" + Object.keys(data));
    for (let attr in data)
        console.log("draw()- key:" + attr + ", value: " + data[attr]);
    keys = Object.keys(data);                                           // with the JSON data, we use the built in Object.keys method to get the keys from the object

    x0.domain([state]);                                                 // now with the JSON data, we grab the state using the STATE_NAME key
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);

    y.domain([0, d3.max([data], function (d) {
        return d3.max(keys, function (key) {
            return d[key];
        });
    })]).nice();

    //------------------bar graph stuff----------------
    g.append("g")
        .selectAll("g")
        .data([data])
        .enter().append("g")
        .attr("transform", function () {
            return "translate( 1,0)";
        })
        .selectAll("rect")
        .data(function (d) {
            console.log("RECT" + keys.map(function (key) {
                return {key: key, value: d[key]}
            }));
            return keys.map(function (key) {
                return {key: key, value: d[key]};
            });
        })

        .enter().append("rect")                                     //The width of each bar
        .attr("x", function (d) {
            return (x1(d.key));
        })

        .attr("y", function (d) {                                  //This draws the height of the bars
            return y(d.value);                                     //This is our final scaled value that we'll use for drawing our bars
        })

        .attr("width", x1.bandwidth())                             //Returns the height of each bar
        .attr("height", function (d) {
            return height - y(d.value);
        })

        .style("stroke", "black")                                   //Color fill
        .attr("fill", function (d) {
            return z(d.key);
        });

    //-------------------label and legend stuff--------------------------

    g.append("g")                                                    //title
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", width / 2)
        .attr("y", y(y.ticks()) + .5)
        .attr("dy", "0.32em")
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .style("font-size", "20px")
        .text(myTitle)

    g.append("g")                                                    //state label on chart
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    g.append("g")                                                    //population text on chart
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks()) + .5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Population");
    let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });
    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z)
        .style("stroke", "black");
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")

        .text(function (d) {
            return d;
        });
    console.log("draw data: " + data);
}
require(["dojo/dom", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"],
    function (dom, on, Query, QueryTask) {
    let queryTask = new QueryTask("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5" /*userAPI*/);
    let query = new Query();
    query.returnGeometry = false;
    on(dom.byId("execute"), "click", execute);

    function execute() {
            query.outFields = xInput2;
            query.text = dom.byId("state").value;
            queryTask.execute(query, showResults2);
        }
        function showResults2(results) {
            let resultItems = {};                                         // create an empty object that will be used to pass the json data to Draw
            let resultCount = results.features.length;                    // get number of items the rest api returned
            let featureAttributes;
            for (let i = 0; i < resultCount; i++) {
                featureAttributes = results.features[i].attributes;
                for (let attr in featureAttributes) {
                    resultItems[attr] = Number(featureAttributes[attr]);  // this takes the JSON name and value and creates the equivalent object.
                }
            }
            draw(resultItems, dom.byId("state").value);
            dom.byId("info").innerHTML = resultItems;
        }
    }
);


//----------------------------------------UPDATE CHART------------------------------------------------
function UpdateChart() {

    let svg = d3.select('svg'),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
    let x1 = d3.scaleBand().padding(0.05); //keys
    let y = d3.scaleLinear().rangeRound([height, 0]);
    let z = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#e2ab08"]);


    function draw(data, state) {
        for (let attr in data)
            keys = Object.keys(data);

        x0.domain([state]);
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);

        y.domain([0, d3.max([data], function (d) {
            return d3.max(keys, function (key) {
                return d[key];
            });
        })]).nice();

        g.append("g")
            .selectAll("g")
            .data([data])
            .enter().append("g")
            .attr("transform", function () {
                return "translate( 1,0)";
            })
            .selectAll("rect")
            .data(function (d) {
                return keys.map(function (key) {
                    return {key: key, value: d[key]};
                });
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return (x1(d.key));
            })

            .attr("y", function (d) {
                return y(d.value);
            })

            .attr("width", x1.bandwidth())
            .attr("height", function (d) {
                return height - y(d.value);
            })

            .style("stroke", "black")
            .attr("fill", function (d) {
                return z(d.key);
            });

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", width / 2)
            .attr("y", y(y.ticks()) + .5)
            .attr("dy", "0.32em")
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .style("font-size", "20px")
            .text(myTitle);

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks()) + .5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Population");
        let legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });
        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z)
            .style("stroke", "black");
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")

            .text(function (d) {
                return d;
            });
    }

//<!------------------------------- Update data query section ------------------------------------------------------------->

    require(["dojo/dom", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"],
        function (dom, on, Query, QueryTask) {
            let queryTask = new QueryTask("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5");
            let query = new Query();
            query.returnGeometry = false;
            on(dom.byId("execute"), "click", execute);

            function execute() {
                query.outFields = xInput2;
                query.text = dom.byId("state").value;
                queryTask.execute(query, showResults2);
            }

            function showResults2(results) {
                let resultItems = {};
                let resultCount = results.features.length;
                let featureAttributes;
                for (let i = 0; i < resultCount; i++) {
                    featureAttributes = results.features[i].attributes;
                    for (let attr in featureAttributes) {
                        resultItems[attr] = Number(featureAttributes[attr]);
                    }
                }
                draw(resultItems, dom.byId("state").value);
                dom.byId("info").innerHTML = resultItems;
            }
        }
    )
}

function clearChart() {
    svg.select("*").remove();
}

function clearText() {
    svg.selectAll("text").remove()
    svg.selectAll("line").remove()
}

function writeTitle() {
    myTitle = document.getElementById("title").value;
}
function ColorFunction() {
    let x = document.createElement("INPUT");
    x.setAttribute("type", "color");
    document.body.appendChild(x);
    console.log("COLOR: " + x.value);
    document.getElementById("rect").style.fill = "#000000";
}

//function for getting x-axis values
function xValues() {
    xInput = document.getElementById("xUserInput").value;
    xInput2 = xInput.split(",");
    //console.log("xinput values" + xInput2);
}

//function for getting REST API
function APIValue() {
    userAPI = document.getElementById("APIInput").value;
}
