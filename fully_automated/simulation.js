/** Functions from clicking radio buttons and buttons **/

  
/** 
    Called when the Start button is pressed 
    
    Pulls values of t and n from sliders 
    If reset button has not been pressed before, sets up the simulation and runs it 
    Else simply runs the simulation 
**/
function start(){
    
    //pull value from sliders
    n = +document.getElementById("n_slot_machines").value;
    t = +document.getElementById("t").value;
    //Case 1: reset button hasn't been pressed
    //Case 2: reset button has been pressed 
    //set reset flag to false to enable the simulation to run and the reset button to work
    
    if(resetFlag === true){
        resetFlag = false; 
        run_simulation();
    } else { 
        //first time 
        setup_simulation();
        run_simulation();
    }
}



/** 
    Called when the Reset button is pressed 
    
    Pulls values of t and n from sliders 
    Sets score to 0
    Resets the slot machines, scales, axes and circle positions 
    Shows ghosts if the "Yes" radio box is ticked for true means 
**/
function reset(){

    //pull value from sliders
    n = +document.getElementById("n_slot_machines").value;
    t = +document.getElementById("t").value;
    
    //reset the score 
	score = 0;
    avg_score = 0; 
    document.getElementById("score_display").innerHTML = 0; 
    
    
    //setting to true kills the simulation if it's running 
	resetFlag = true; 
	
	//reset slot machines 
	slot_machines = create_slot_machines(n);
    
	//reset the scales 
	setup_scales();
    
	//reset axes 
	//probably don't have to reset x axis but i'll do it anyway 
	reset_axes();
    
    //bring all circles back to 0, change the amount if n has changed 
	setup_circle_position(); 
	reset_circles(); 
    
    //if true means radiobox checked, call it 
    if(document.getElementById("ghosts_yes").checked === true){ 
        show_ghosts();
    } 
}

  
 /** 
	Display the true means of each circle
    Triggered by the Yes radio button for true means
**/
function show_ghosts(){
    ghostFlag = true;
    ghost_circles =  svg.selectAll("circle.true_mean")
        .data(slot_machines);
        
    //drop old circles
    ghost_circles
        .exit()
        .remove(); 
    
    //change existing circles 
    svg.selectAll("circle.true_mean")
        .attr("class", "true_mean")
        .attr("r", radius)
        .attr("cx", (d)=> d.cx)
        .attr("cy", (d)=> yScale(d.true_mean))
        .style("fill", "#F66A00");
  
    //add new circles 
    ghost_circles
        .enter()
        .append("circle")
            .attr("class", "true_mean")
            .attr("r", radius)
            .attr("cx", (d)=> d.cx)
            .attr("cy", (d)=> yScale(d.true_mean))
            .style("fill", "#F66A00");
}

/** 
	Hide the true means of each circle
    Triggered when No radio button for true means is checked
**/
function hide_ghosts(){
    ghostFlag = false;
    ghost_circles  = svg.selectAll("circle.true_mean")
        .remove();
}


/** 
	Slider Functions:
	A collection of functions that update variables when the sliders are moved   
**/

//Speed of simulation - time between ticks 
function set_time_between_ticks(){
	//pull the slider value
	interval = +document.getElementById("speed").value;
	//update the label with display 
	document.getElementById('speed_display').innerHTML = interval;
} 


// Number of slot machines
function set_n_slot_machines(){
    // problems with changing n mid run 
	 // n = +document.getElementById("n_slot_machines").value;
	//update HTML display 
    n_temp = +document.getElementById("n_slot_machines").value;
	document.getElementById('n_slot_machine_display').innerHTML = n_temp;
}


// Epsilon
function set_epsilon(){
	epsilon = +document.getElementById("epsilon").value;
	//update HTML display 
	document.getElementById('epsilon_display').innerHTML = epsilon;
}


// Number of ticks t 
function set_t(){
	t_temp = +document.getElementById("t").value;
	//update HTML display 
	document.getElementById('t_display').innerHTML = t_temp;
}



/** Functions to set up the simulation, draw circles,axes, scales etc **/

/** 
	Set up the SVG box and the borders for the simulation. 
**/
function setup_svg(){
	svg = d3.select("svg");

	//Define a buffer to have around the borders of the svg element 
    border = {
		top: 20, 
		bottom: 60,
		left: 50, 
		right: 20
	}

    width = +svg.attr("width") - border.left - border.right;
    height = +svg.attr("height")- border.bottom - border.top;

    svg = svg.append("g")
	.attr("transform",   "translate(" + border.left + "," + border.top + ")");
}

/** 
	Creates slot machines
	Creates scales
	Draws axes and labels 
	Draws circles 
**/
function setup_simulation(){

    //if reset button has been pressed, we don't need to set up the axes and slot machines 
    // Create the slot machines, set up their properties 
    slot_machines = create_slot_machines(n);  

    // Set the x and y scales 
    setup_scales();

    // Use the x and y scales to draw axes and axes labels
    //must be called after create_slot_machines otherwise x-axis labels won't draw correctly 
    setup_axes();
  
	//Set the initial position of the circles
	//must be called after setup_scales otherwise the scales won't be defined 	
	setup_circle_position(); 

	//Draws the circles on the page 
	draw_circles()
}

/** 
	Initialises the x and y scales
**/
function setup_scales(){
	 // the domain is hardcoded for now
	 yScale = d3.scaleLinear()
		.domain([4,-4])
		.range([0,height]);
		
	//Use a point scale rather than a band scale because of the circles
	xScale = d3.scalePoint()
		.domain(slot_machines.map((d) => d.name))
		.range([0, width])
		.padding(0.5);	
}

/** 
	Draws the axes and the axis labels
**/
function setup_axes(){
	// set up the y axis 
	yAxis = d3.axisLeft(yScale);

	// add the y axis 
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);  
	
	//add label for y axis 
	svg.append("text")
        .attr("class", "y axis")
		.attr("transform", "rotate(-90)")
		.attr("x", 0 - height /2)
		.attr("y", 0 - border.left + 10)	
		.attr("dy", "1em")
		.style("text-anchor", "middle")   
		.text("Average Reward");
		
	
	//set up x axis 
    //add labels to ticks only if we have less than 30 slot machines 
    if(n > 30){
        xAxis = d3.axisBottom(xScale)
            .tickFormat("");
    } else {
        xAxis = d3.axisBottom(xScale);
    }
    
	//add x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

	//add x axis title 
    svg.append("text")
        .attr("class", "x axis")
        .attr("y", height + (border.bottom - 20))
        .attr("x", width /2)
        .style("text-anchor", "middle")
        .text("Slot Machine");
}


/** 
	Sets the initial x/y position of the circles. 
	Sets the initial cx and the cy properties of the slot machines. 
	Relies on setup_scales() being called beforehand to define xScale and yScale. 
**/	
function setup_circle_position(){
	for(var i = 0; i < slot_machines.length; i++) {
		slot_machines[i].cx = xScale(slot_machines[i].name)
		slot_machines[i].cy = yScale(0)
	};	
} 


/** 
	Updates the axes to reflect a new amount of slot machines 
**/
function reset_axes(){
		yAxis = d3.axisLeft(yScale);
		
              //add labels to ticks only if we have less than 30 slot machines 
        if(n > 30){
            xAxis = d3.axisBottom(xScale)
                .tickFormat("");
        } else {
            xAxis = d3.axisBottom(xScale);
        }
        
		svg.selectAll("g.y.axis")
            .attr("class", "y axis")
			.call(yAxis);

		svg.selectAll("g.x.axis")
            .attr("class", "x axis")
			.call(xAxis);
}	

   
/** 
    Binds new slot_machines data to the average reward circles 
    Removes redundant circles 
    Adds new circles 
    Sets all circles to the origin 
**/
function reset_circles(){
  //   debugger;
    circles = svg.selectAll("circle.average_reward")
        .data(slot_machines);

    //drop old circles 
    circles.exit().remove(); 
    
    //change existing circles 
    svg.selectAll("circle.average_reward")
        .attr("cx", (d) => d.cx)
        .attr("cy", (d) => d.cy)
        .attr("r", radius);
        
    //add new ones 
    circles.enter()
        .append("circle")
            .attr("class","average_reward")
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .attr("r", radius);
            
    circles = svg.selectAll("circle.average_reward");
}    
    


/** 
	Draws circles for the average reward for slot machines
**/
function draw_circles(){
	// Initalise the circles
	circles = svg.selectAll("circle.average_reward")
		.data(slot_machines)
		.enter()
		.append("circle")
            .attr("class", "average_reward")
			.attr("cx", (d) => d.cx)
			.attr("cy", (d) => d.cy)
			.attr("r", radius);
} 
/** Functions related to creation of slot machines and simulating **/ 

/**
 Make an array of objects that represent slot machines. Each object has: 
 - a name
 - true mean
 - a function to allow drawing (normal dist with mean true mean and sd 1 ) 
 - number of times chosen 
 - total reward 
 - average reward 
**/  
function create_slot_machines(n_slot_machines) {
	slot_machines = Array(n_slot_machines);
	standard = gaussian(0,1);
	
    //create true means - normally distributed around 0,1 
	//instalise the number of times each slot machine is chosen as 0 at the start
	//the total reward is 0 and the average reward is 0 
	for(var i = 0; i < n_slot_machines; i++){
		slot_machines[i] = {};
		slot_machines[i].name = "#" + (i+1);
		slot_machines[i].true_mean = standard();
		slot_machines[i].pull_lever = gaussian(slot_machines[i].true_mean, 1);
		slot_machines[i].n_chosen = 0;
		slot_machines[i].total_reward = 0;
		slot_machines[i].average_reward = 0;	
	}
	return(slot_machines);
}




/**
	Returns an integer denoting which slot machine to pick by the epsilon-greedy method. 
	Inputs:
		- epsilon: the chance of choosing randomly
		- n: the number of slot machines:  
		- average_rewards: the average reward of each slot machine
**/
function choose_slot_machine(epsilon, n, average_rewards){
	//simulate a random number - if this number is below epsilon choose randomly 
	//else choose whichever slot machine has the highest probability 
	x = Math.random() 
	if(x <= epsilon){
		//choose randomly 
		return Math.floor(Math.random()* n); 
	}  else {
		//greedy choice 
		 original = average_rewards;
		 max_reward = average_rewards.slice(0).sort( (x,y) => y-x)[0]
		 index = original.indexOf(max_reward)
		return index;
	}	
}


/** 
	Runs the simulation. 
	Performs one iteration of the simulation every "interval" seconds. 
	Checks to see if the reset button is triggered at any point
		If it is, stop the simulation
**/
function run_simulation(){
	// used for loop termination 
	var count = 0; 
	averages = Array(t);
    
	//run the function every interval miliseconds 
	var interval_fn = setInterval(function () {
		count = count + 1;
        
        //Stop after we have reached t iterations
		//Also stop after the reset button is clicked
		if (count > t | resetFlag === true) {
			count = 0; 
			clearInterval(interval_fn);
			avgReward_Graph();
            return; 
		}
        
		//extract the average rewards from the slot machines
		var average_rewards = slot_machines.map((d) => d.average_reward)

		//choose slot machine
		var choice = choose_slot_machine(epsilon, n, average_rewards)

		//generate reward
		var reward = slot_machines[choice].pull_lever()

		//update slot machine parameters
		slot_machines[choice].n_chosen += 1;
		slot_machines[choice].total_reward += reward;
		slot_machines[choice].average_reward = slot_machines[choice].total_reward / slot_machines[choice].n_chosen;

		//update circle location
		slot_machines[choice].cy = yScale(slot_machines[choice].average_reward)

		//update circle position on the canvas
		circles.attr("cx", (d) => d.cx)
		circles.attr("cy", (d) => d.cy)

		//update circle size to an area proportional to number chosen plus some constant (so you can see the small circles )
		circles.attr("r", (d) =>  radius + Math.sqrt(d.n_chosen / Math.PI))
	
		//update score
		score += reward;
		avg_score = score / count
		document.getElementById("score_display").innerHTML = avg_score;

		averages[count-1] = {};
		averages[count-1].time = count;
		averages[count-1].avg_score = avg_score;
	}, interval)
}
/** 
	Generates the graph for average reward vs steps
**/
function avgReward_Graph(){
	var width = 740,
	height = 400,
	svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

	//Define a buffer to have around the borders of the svg element 
	border = {
		top: 20, 
		bottom: 60,
		left: 50, 
		right: 20
	}
	
	width = +svg.attr("width") - border.left - border.right;
	height = +svg.attr("height")- border.bottom - border.top;

	svg = svg.append("g")
	.attr("transform",   "translate(" + border.left + "," + border.top + ")");

	averages.sort( (x,y) => x.time - y.time );

	console.log(averages);
	console.log(averages.length);

	var valueX = function (d){ return d.time; };
	var valueY = function (d){ return d.avg_score; };

	var scaleX = d3.scaleLinear()
	.domain(d3.extent(averages, valueX))
	.range([0, width]);


	xAxis = d3.axisBottom(scaleX);
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

	//add x axis title 
	svg.append("text")
	.attr("class", "x axis")
	.attr("y", height + (border.bottom - 20))
	.attr("x", width /2)
	.style("text-anchor", "middle")
	.text("Iterations");
	

	var scaleY = d3.scaleLinear()
	.domain(d3.extent(averages, valueY))
	.range([height, 0]);

	yAxis = d3.axisLeft(scaleY);

	// add the y axis 
	svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);  
	
	//add label for y axis 
	svg.append("text")
        .attr("class", "y axis")
		.attr("transform", "rotate(-90)")
		.attr("x", 0 - height /2)
		.attr("y", 0 - border.left + 1)	
		.attr("dy", "1em")
		.style("text-anchor", "middle")   
		.text("Average Reward");


	var line = d3.line()
	.x(function(d) { return scaleX(valueX(d)); })
	.y(function(d) { return scaleY(valueY(d)); });

	svg.append("path")
	.attr("d", line(averages))
	.attr("stroke", "black")
	.attr("fill", "none");
}

/** Store all the statistical functions used **/ 

/** 
	Returns a gaussian random function with the given mean and stdev.
	Note that this returns a function, not a value. 
**/
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       return retval;
   }
}


