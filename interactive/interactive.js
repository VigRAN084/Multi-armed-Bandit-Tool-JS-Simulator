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

function setup_interactive_machines(){

    //if reset button has been pressed, we don't need to set up the axes and slot machines 
    // Create the slot machines, set up their properties 
    slot_machines = create_slot_machines(3);
    updateScoresForUserMachine(1);
    updateScoresForUserMachine(2);
    updateScoresForUserMachine(3);
}

function updateScoresForUserMachine(n) {
    document.getElementById('user_reward'+ n).innerHTML = slot_machines[n-1].total_reward;
    document.getElementById('user_n' + n).innerHTML = slot_machines[n-1].n_chosen;
}

function updateTotalUserScore() {
    document.getElementById('userScore').innerHTML = user_score;
}

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

function generateRewardUser(choice) {        
    //extract the average rewards from the slot machines
    var average_rewards = slot_machines.map((d) => d.average_reward)

    //generate reward
    var reward = slot_machines[choice-1].pull_lever()

    //update slot machine parameters
    slot_machines[choice-1].n_chosen += 1;
    slot_machines[choice-1].total_reward += reward;
    slot_machines[choice-1].average_reward = slot_machines[choice-1].total_reward / slot_machines[choice-1].n_chosen;

    //update score
    user_score += reward;
    updateScoresForUserMachine(choice);
    updateTotalUserScore();
}


function generateRewardAlgo() {        
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
}

