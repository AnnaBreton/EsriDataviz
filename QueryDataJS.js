
var resultItems3;
var xInput;
var xInput2 = [];


function xValues() {
    xInput = document.getElementById("xUserInput").value;
    xInput2 = xInput.split(",");
    console.log("xinput values" +xInput2);
    //alert(xInput2);
}


let svg = d3.select('svg'),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
let x1 = d3.scaleBand().padding(0.05); //keys

//height of the graph space that we're drawing in
let y = d3.scaleLinear().rangeRound([height, 0]);
let z = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#e2ab08"]);

//testing for getting x-axis data
//let xData = document.getElementById("xdata").value;
//let xInput = [xData];
//console.log(" X Input = " + xInput);

//Draw Function
function draw(data, state) {

    console.log("keys" + Object.keys(data));
    // print out key and values
    for (let attr in data)
        console.log("draw()- key:" + attr + ", value: " + data[attr]);

    //var keys = data.columns.slice(1); <-- old way of getting the keys from CVS generate object
    keys = Object.keys(data);   // with the JSON data, we use the built in Object.keys method to get the keys from the object
    //console.log("printing keys variable: " + keys); // print them out for debugging


    x0.domain([state]);  // now with the JSON data, we grab the state using the STATE_NAME key
    //console.log("x0.bandwidth =" + x0.bandwidth());
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);

    //console.log("before  call y.domain ");
    /*y.domain([0, 9000000]).nice;*/
    y.domain([0, d3.max([data], function (d) {  // --------> Needed change data to [data] to convert the data object into an array
        //console.log("y.domain1: " + d);
        return d3.max(keys, function (key) {
            //console.log("y.domain2: " + d[key]);
            return d[key];
        });
    })]).nice();

    //------------------bar graph stuff----------------

    g.append("g")
        .selectAll("g")
        .data([data])    //-------> Needed change data to [data] to convert the data object into an array
        .enter().append("g")
        .attr("transform", function () {
            return "translate( 1,0)"; //----> This is still not working....was return "translate(" + x0(d.State) + ",0)";
        })
        .selectAll("rect")
        .data(function (d) {
            console.log("RECT" + keys.map(function (key) {
                //console.log("key and value: " + key + ", " + d[key]);
                return {key: key, value: d[key]}
            }));
            return keys.map(function (key) {
                //console.log("key and value: " + key + ", " + d[key]);
                return {key: key, value: d[key]};
            });
        })

        //the width of each bar
        .enter().append("rect")
        .attr("x", function (d) {
            //console.log("x1 stuff: " + (x1(d.key)));
            return (x1(d.key));
        })

        // These next 2 are where we calculate the data to draw the correct height of each bar
        //this draws the height of the bars. the lower the number, the higher the bar.
        //y(d.value) y scales our d.value values(pop data) to fit within our graph properly
        .attr("y", function (d) {
            console.log("height " + (y(d.value)));
            //this is our final scaled value that we'll use for drawing our bars
            return y(d.value);
        })

        //returns the height of each bar, larger number is taller
        .attr("width", x1.bandwidth())
        .attr("height", function (d) {
            //console.log("height - " + (height - y(d.value)));
            return height - y(d.value);
        })

        //color fill
        .style("stroke", "black") //black outline around bars
        .attr("fill", function (d) {
            //console.log("z" + z(d.key))
            return z(d.key);
        });

    //-------------------label and legend stuff--------------------------

    //title
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
        //.attr("text-anchor", "start")
        .text(myTitle)

    //state label on chart
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    //population text on chart
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
    console.log("draw data: " + data);
}


require([

    "dojo/dom", "dojo/on",
    "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"
], function (dom, on, Query, QueryTask) {
    let queryTask = new QueryTask("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5");
    let query = new Query();


    query.returnGeometry = false;
   // xValues();
    console.log("The x Input array values: " + xInput2);
    //This is where we place which fields we want on the x-axis


    on(dom.byId("execute"), "click", execute);

    function execute() {
        query.outFields = xInput2;
        query.text = dom.byId("state").value;
        queryTask.execute(query, showResults2);
    }

    function showResults2(results) {
        let resultItems = {};  // create an empty object that will be used to pass the json data to Draw
        let resultCount = results.features.length; // get number of items the rest api returned
        let featureAttributes;
        for (let i = 0; i < resultCount; i++) {
            featureAttributes = results.features[i].attributes;
            for (let attr in featureAttributes) {
                //console.log("featureAttributes.. attribute " + attr + ",  value:" + featureAttributes[attr]);
                resultItems[attr] = Number(featureAttributes[attr]);  // this takes the JSON name and value and creates the equivalent object.
            }
        }
        draw(resultItems, dom.byId("state").value);
        dom.byId("info").innerHTML = resultItems;
    }
});


function UpdateChart() {
    var resultItems3;

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

        for (let attr in data)
            keys = Object.keys(data);

        x0.domain([state]);
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);

        y.domain([0, d3.max([data], function (d) {
            return d3.max(keys, function (key) {
                return d[key];
            });
        })]).nice();
        //------------------bar graph stuff-------------------------------------
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

            //the width of each bar
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

            //color fill
            .style("stroke", "black")
            .attr("fill", function (d) {
                return z(d.key);
            });

        //-------------------label and legend stuff-------------------------------------------

        //title
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

        //state label on chart
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        //population text on chart
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

    require([
        "dojo/dom", "dojo/on",
        "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"
    ], function (dom, on, Query, QueryTask) {
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
    })
}

function clearChart() {
    svg.select("*").remove();
}

function clearText() {
    svg.selectAll("text").remove()
    svg.selectAll("line").remove()
}

var myTitle;

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
