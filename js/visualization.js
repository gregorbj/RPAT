    // JAVASCRIPT TO IMPLEMENT THE VISUALIZATION
    //==========================================

    // Establish the crossfilter
    //--------------------------
    var facts = crossfilter(data);

    // Set up all of the dc.js chart objects
    //--------------------------------------
    // Set up the pie chart objects to display scenario input levels
    var
        bikePieChart = dc.pieChart("#Bike"),
        vmtchargePieChart = dc.pieChart("#VmtCharge"),
        demandmgtPieChart = dc.pieChart("#DemandMgt"),
        landusePieChart = dc.pieChart("#LandUse"),
        parkingPieChart = dc.pieChart("#Parking"),
        transitPieChart = dc.pieChart("#Transit")
    ;
    // Set up the bar chart objects to display scenario output levels
    var
        crashesBarChart = dc.barChart("#Crashes"),
        costBarChart = dc.barChart("#Cost"),
        dvmtBarChart = dc.barChart("#Dvmt"),
        emissionsBarChart = dc.barChart("#Emissions"),
        fuelBarChart = dc.barChart("#Fuel"),
        timeBarChart = dc.barChart("#Time")
    ;
    // Set up the number objects to display output averages
    var
        crashAveNum = dc.numberDisplay("#Fatalities-Injuries")
        costAveNum = dc.numberDisplay("#Ave-Cost"),
        dvmtAveNum = dc.numberDisplay("#Ave-Dvmt"),
        emissionsAveNum = dc.numberDisplay("#Ave-Emissions"),
        fuelAveNum = dc.numberDisplay("#Ave-Fuel"),
        timeAveNum = dc.numberDisplay("#Ave-VHT")
    ;
    // Set up table to display values for selected scenarios
    var scenarioTable = dc.dataTable("#Scenario-Results");
    // Set up display of total selected scenarios
    var all = facts.groupAll();
    dc.dataCount(".num-selected-scenarios")
        .dimension(facts)
        .group(all);


    // Establish a crossfilter dimensions for the scenario data
    //---------------------------------------------------------
    // Establish the scenario input dimensions to be displayed and filtered
    var
        bikeDim = facts.dimension( function(d) {return d.Bike;} ),
        vmtchargeDim = facts.dimension( function(d) {return d.VmtChrg;} ),
        demandmgtDim = facts.dimension( function(d) {return d.DemandMgt;} ),
        landuseDim = facts.dimension( function(d) {return d.LandUse;} ),
        parkingDim = facts.dimension( function(d) {return d.Parking;} ),
        transitDim = facts.dimension( function(d) {return d.Transit;} )
    ;
    // Establish the scenario output dimensions to be displayed and filtered
    var
        crashDim = facts.dimension( function(d) {return d.FatalityInjuryRate;} ),
        costDim = facts.dimension( function(d) {return d.AveCost;} ),
        dvmtDim = facts.dimension( function(d) {return d.AveDvmt;} ),
        emissionsDim = facts.dimension( function(d) {return d.AveEmissions;} ),
        fuelDim = facts.dimension( function(d) {return d.AveFuel;} ),
        timeDim = facts.dimension( function(d) {return d.AveVehHr;} )
    ;

    // Establish the group statistics to display
    //------------------------------------------
    // Establish the scenario input group statistics (counts) to be displayed as pie wedges
    var
        bikeGroup = bikeDim.group(),
        vmtchargeGroup = vmtchargeDim.group(),
        demandmgtGroup = demandmgtDim.group(),
        landuseGroup = landuseDim.group(),
        parkingGroup = parkingDim.group(),
        transitGroup = transitDim.group()
    ;
    // Establish the bin dimensions for bar charts (to be used in grouping)
    var measures = [ "FatalityInjuryRate", "AveCost", "AveDvmt", "AveEmissions",
                    "AveFuel", "AveVehHr" ]
    var bins = {};
    var calcBinning = function(data, measure, nBins) {
        var xExtent = d3.extent(data, function(d) {return d[measure];});
        var xWidth = (xExtent[1] - xExtent[0]) / nBins;
        return { xExtent: xExtent, xWidth: xWidth };
    };
    for( var i=0; i<measures.length; i++ ) {
        bins[measures[i]] = calcBinning( data, measures[i], 15 );
    };
    // Establish the output group statistics (counts) to be displayed in bar charts
    var
        crashGroup = crashDim.group(function(d) {return Math.floor(d / bins.FatalityInjuryRate.xWidth) * bins.FatalityInjuryRate.xWidth;}),
        costGroup = costDim.group(function(d){return Math.floor(d / bins.AveCost.xWidth) * bins.AveCost.xWidth;}),
        dvmtGroup = dvmtDim.group(function(d){return Math.floor(d / bins.AveDvmt.xWidth) * bins.AveDvmt.xWidth;}),
        emissionsGroup = emissionsDim.group(function(d){return Math.floor(d / bins.AveEmissions.xWidth) * bins.AveEmissions.xWidth;}),
        fuelGroup = fuelDim.group(function(d){return Math.floor(d / bins.AveFuel.xWidth) * bins.AveFuel.xWidth;}),
        timeGroup = timeDim.group(function(d){return Math.floor(d / bins.AveVehHr.xWidth) * bins.AveVehHr.xWidth;})
    ;
    // Define reduce functions to calculate output measure averages for filtered selections
    function addAvg(attr) {
        return function(p,v) {
            ++p.count
            p.sum += v[attr];
            p.avg = p.sum/p.count;
            //p.ref = refValues[attr];
            return p;
        };
    }
    function remAvg(attr) {
        return function(p,v) {
            --p.count
            p.sum -= v[attr];
            p.avg = p.sum/p.count;
            //p.ref = refValues[attr];
            return p;
        };
    }
    function iniAvg() {
        return {count:0, sum:0, avg:0}; //, ref:0};
    }
    // Establish the output group output measure averages
    var
        allDim = facts.dimension( function(d) {return Math.round(d.FatalityInjuryRate / d.FatalityInjuryRate);} ),
        crashAveGroup = allDim.group().reduce(addAvg("FatalityInjuryRate"), remAvg("FatalityInjuryRate"), iniAvg),
        costAveGroup = allDim.group().reduce(addAvg("AveCost"), remAvg("AveCost"), iniAvg),
        dvmtAveGroup = allDim.group().reduce(addAvg("AveDvmt"), remAvg("AveDvmt"), iniAvg),
        emissionsAveGroup = allDim.group().reduce(addAvg("AveEmissions"), remAvg("AveEmissions"), iniAvg),
        fuelAveGroup = allDim.group().reduce(addAvg("AveFuel"), remAvg("AveFuel"), iniAvg),
        timeAveGroup = allDim.group().reduce(addAvg("AveVehHr"), remAvg("AveVehHr"), iniAvg)
    ;

    // Plot the input pie charts
    //--------------------------
    // Define layout variables that are common to all the pie charts
    var
        pieWidth = 160,
        pieHeight = 160,
        pieRadius = 60,
        pieInnerRadius = 20,
        pieMargins = {top: 10, right: 10, bottom: 10, left: 10}
    ;
    // Community category input levels
    bikePieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(2)
        .dimension(bikeDim)
        .group(bikeGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.Oranges[3])
        .legend(dc.legend());
    // Marketing category input levels
    vmtchargePieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(3)
        .dimension(vmtchargeDim)
        .group(vmtchargeGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.Blues[3])
        .legend(dc.legend());
    // Pricing category input levels
    demandmgtPieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(3)
        .dimension(demandmgtDim)
        .group(demandmgtGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.YlOrBr[3])
        .legend(dc.legend());
    // Fleet category input levels
    landusePieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(2)
        .dimension(landuseDim)
        .group(landuseGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.Greens[3])
        .legend(dc.legend());
    // Gas price category input levels
    parkingPieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(3)
        .dimension(parkingDim)
        .group(parkingGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.Reds[3])
        .legend(dc.legend());
    // Income category input levels
    transitPieChart.width(pieWidth)
        .height(pieHeight)
        .radius(pieRadius)
        .innerRadius(pieInnerRadius)
        .slicesCap(3)
        .dimension(transitDim)
        .group(transitGroup)
        .label(function (d){return d.value;})
        .ordinalColors(colorbrewer.Purples[3])
        .legend(dc.legend());

    // Plot the output bar charts
    //---------------------------
    // Define layout variables that are common to all the bar charts
    var
        barWidth = 240,
        barHeight = 100,
        barMargins = {top: 10, right: 10, bottom: 20, left: 25}
    ;
    // Traffic fatalities and injuries
    crashesBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(crashDim)
        .group(crashGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(40)
        .x(d3.scale.linear().domain(bins.FatalityInjuryRate.xExtent))
        .elasticY(true)
        .yAxisLabel("# Scenarios")
        .xAxis().tickFormat();
    crashesBarChart.xAxis().ticks(5);
    crashesBarChart.yAxis().ticks(5);
    crashesBarChart.xUnits(function(){return 4.8;});
    // Average per capita vehicle cost
    costBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(costDim)
        .group(costGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(40)
        .x(d3.scale.linear().domain(bins.AveCost.xExtent))
        .elasticY(true)
        .xAxis().tickFormat();
    costBarChart.xAxis().ticks(5);
    costBarChart.yAxis().ticks(5);
    costBarChart.xUnits(function(){return 4.8;});
    // Average per capita daily vehicle miles of travel
    dvmtBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(dvmtDim)
        .group(dvmtGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(40)
        .x(d3.scale.linear().domain(bins.AveDvmt.xExtent))
        .elasticY(true)
        .xAxis().tickFormat();
    dvmtBarChart.xAxis().ticks(5);
    dvmtBarChart.yAxis().ticks(5);
    dvmtBarChart.xUnits(function(){return 4.8;});
    // Average annual greenhouse gas emissions per capita
    emissionsBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(emissionsDim)
        .group(emissionsGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(40)
        .x(d3.scale.linear().domain(bins.AveEmissions.xExtent))
        .elasticY(true)
        .xAxis().tickFormat();
    emissionsBarChart.xAxis().ticks(5);
    emissionsBarChart.yAxis().ticks(5);
    emissionsBarChart.xUnits(function(){return 4.8;});
    // Average gallons of fuel consumed per person
    fuelBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(fuelDim)
        .group(fuelGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(100)
        .x(d3.scale.linear().domain(bins.AveFuel.xExtent))
        .elasticY(true)
        .yAxisLabel("# Scenarios")
        .xAxis().tickFormat();
    fuelBarChart.xAxis().ticks(5);
    fuelBarChart.yAxis().ticks(5);
    fuelBarChart.xUnits(function(){return 2.65;});
    // Average daily vehicle hours of travel per person
    timeBarChart.width(barWidth)
        .height(barHeight)
        .margins(barMargins)
        .dimension(timeDim)
        .group(timeGroup)
        .transitionDuration(200)
        .centerBar(true)
        .gap(40)
        .x(d3.scale.linear().domain(bins.AveVehHr.xExtent))
        .elasticY(true)
        .xAxis().tickFormat();
    timeBarChart.xAxis().ticks(5);
    timeBarChart.yAxis().ticks(5);
    timeBarChart.xUnits(function(){return 4.8;});

    // Display the average values for outputs
    //---------------------------------------
    crashAveNum.group(crashAveGroup).valueAccessor(function(p) {return p.value.avg;});
    costAveNum.group(costAveGroup).valueAccessor(function(p) {return p.value.avg;});
    dvmtAveNum.group(dvmtAveGroup).valueAccessor(function(p) {return p.value.avg;});
    emissionsAveNum.group(emissionsAveGroup).valueAccessor(function(p) {return p.value.avg;});
    fuelAveNum.group(fuelAveGroup).valueAccessor(function(p) {return p.value.avg;});
    timeAveNum.group(timeAveGroup).valueAccessor(function(p) {return p.value.avg;});

    // Display the scenario data table for the top 10 scenarios
    //---------------------------------------------------------
    scenarioTable.width(960).height(800)
        .dimension(crashDim)
        .group(function(d) {return "";})
        .columns([
            function(d) {return d.Bike;},
            function(d) {return d.DemandMgt;},
            function(d) {return d.LandUse;},
            function(d) {return d.Parking;},
            function(d) {return d.Transit;},
            function(d) {return d.VmtChrg;},
            function(d) {return d.FatalityInjuryRate;},
            function(d) {return d.AveCost;},
            function(d) {return d.AveDvmt;},
            function(d) {return d.AveEmissions;},
            function(d) {return d.AveFuel;},
            function(d) {return d.AveVehHr;},
        ])
        .sortBy(function(d) {return d.AveEmissions;})
        .order(d3.ascending)
        .size(500);

    // Render all of the graphic elements
    //-----------------------------------
    dc.renderAll();
