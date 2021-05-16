import * as d3 from 'd3';


function drawLiq(container, name, date, data, zoomLevel, isLastStock, divTitle, allSvg, allLiqSvg, handleLiqSvg){
    let names = name.split("//"); 
    let liqName = names[1];// in production, Use name instead of liqName
    let symbol = names[0].split('--')[1]; // extract symbol

    // extract the size of the division
    let division = document.getElementById(divTitle.split("--")[1]);
    const heightNum = (1/3) * division.clientHeight,
        widthNum = division.clientWidth,
        yAxisStartPoint= 0.055,
        xAxisStartPoint=0.028,
        lastStockScale = isLastStock ? 0.5 : 2;

    // time parser
    let timeParser = d3.timeParse("%H:%M:%S.%L");

    // fetch data
    let localData = data[symbol][date];

    // convert date format
    let newTime = localData["time"].map(timeParser);
    localData["time"] = newTime;

    // time is the same for all groups
    const maxDate = d3.max(localData["time"]);
    const minDate = d3.min(localData["time"]);

    // draw the viz
    document.getElementById(container).innerHTML = "";
    let svg = d3.select('#' + container)
    .append('svg')
    .attr('id', symbol+'--svg')
    .attr('class', 'liq-svg')
    .attr("viewBox", `0 0 ${widthNum} ${heightNum}`);

    // define axis
    let x = d3.scaleTime()
            .domain(d3.extent([minDate, maxDate]))
            .range([0, widthNum]);
    let y = d3.scaleBand()
            .range([heightNum, 0])
            .domain([liqName]);



    // synthetic data for liquidity
    let syntData = Array.from({ length: localData["value"].length },
                                     () => Math.floor( Math.random() * y.bandwidth())); 

    // create gradient
    svg.append("g")
    .append("defs")
    .append("linearGradient")
    .attr("id","liqGradient")
    .attr("x1","0%")
    .attr("x2","0%")
    .attr("y1","100%")
    .attr("y2","0%")
    .selectAll("stop")
      .data([
        {offset: "0%", color: "#ff8080"},
        {offset: "50%", color: "#ff8080"},
        {offset: "50%", color: "#33cc33"},
        {offset: "100%", color: "#33cc33"}
      ])
    .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    
    // create area charts
    let bandSize = y.bandwidth(),
        pivot = y(liqName);
    svg.append("path")
        .datum(localData["time"])
        .attr("stroke", "#e6e6e6")
        .attr("stroke-width", 0.5)
        .attr("d", d3.area()
                    .x(d => {return x(d);})
                    .y0(0.5 * bandSize)
                    .y1(d => {
                        return syntData[localData["time"].indexOf(d)];
                    }))
        .style("fill", "url(#liqGradient)");

    if(isLastStock){
      // assemble axis
      svg.append("g")
      .attr("id", "xaxis")
      .attr("class", "axis")
      .attr("transform", "translate("+ 0 +"," +  lastStockScale * heightNum + ")")
      .call(d3.axisBottom(x).ticks(5))
      .select(".domain")
      .attr("display", "none");
    }

    svg.append("g")
        .attr("id", "yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(y))
        .select(".domain")
        .attr("display", "none");


    // add circles  for hovering in the area chart
    svg.selectAll(".liqPoint")
       .data(localData["time"])
       .enter()
       .append("circle")
       .attr("class", "liqPoint")
       .attr("cx", d => {return x(d)})
       .attr("cy", d => {return syntData[localData["time"].indexOf(d)]})
       .attr("r", "1")
       .style("fill", "none")
                            

    
   
      
  // add svg for tracking the records
  handleLiqSvg(divTitle.split("--")[1], liqName, svg);
};


export default drawLiq;