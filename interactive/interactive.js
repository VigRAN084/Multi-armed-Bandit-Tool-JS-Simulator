function create_slot_machines(n_user_slot_machines, n_algo_slot_machines) {
	user_slot_machines = Array(n_user_slot_machines);
    algo_slot_machines = Array(n_algo_slot_machines);
	standard = gaussian(0,1);
	
    //create true means - normally distributed around 0,1 
	//instalise the number of times each slot machine is chosen as 0 at the start
	//the total reward is 0 and the average reward is 0 
	for(var i = 0; i < n_user_slot_machines; i++){
		user_slot_machines[i] = {};
		user_slot_machines[i].name = "#" + (i+1);
		user_slot_machines[i].true_mean = standard();
		user_slot_machines[i].pull_lever = gaussian(user_slot_machines[i].true_mean, 1);
		user_slot_machines[i].n_chosen = 0;
		user_slot_machines[i].total_reward = 0;
		user_slot_machines[i].average_reward = 0;	
	}
    for(var i = 0; i < n_algo_slot_machines; i++){
		algo_slot_machines[i] = {};
		algo_slot_machines[i].name = "#" + (i+1);
		algo_slot_machines[i].true_mean = standard();
		algo_slot_machines[i].pull_lever = gaussian(algo_slot_machines[i].true_mean, 1);
		algo_slot_machines[i].n_chosen = 0;
		algo_slot_machines[i].total_reward = 0;
		algo_slot_machines[i].average_reward = 0;	
	}
}

function setup_interactive_machines(){

    //if reset button has been pressed, we don't need to set up the axes and slot machines 
    // Create the slot machines, set up their properties 
    create_slot_machines(3,3);
    updateScoresForUserMachine(1);
    updateScoresForUserMachine(2);
    updateScoresForUserMachine(3);


}

function updateScoresForAlgoMachine(n) {
    document.getElementById('alg_reward'+ n).innerHTML = algo_slot_machines[n-1].total_reward;
    document.getElementById('alg_n' + n).innerHTML = algo_slot_machines[n-1].n_chosen;
}

function updateTotalAlgoScore() {
    document.getElementById('aScore').innerHTML = alg_score;
}


function updateScoresForUserMachine(n) {
    document.getElementById('user_reward'+ n).innerHTML = user_slot_machines[n-1].total_reward;
    document.getElementById('user_n' + n).innerHTML = user_slot_machines[n-1].n_chosen;
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
    var average_rewards = user_slot_machines.map((d) => d.average_reward)

    //generate reward
    var reward = user_slot_machines[choice-1].pull_lever()

    //update slot machine parameters
    user_slot_machines[choice-1].n_chosen += 1;
    user_slot_machines[choice-1].total_reward += reward;
    user_slot_machines[choice-1].average_reward = user_slot_machines[choice-1].total_reward / user_slot_machines[choice-1].n_chosen;

    //update score
    user_score += reward;
    updateScoresForUserMachine(choice);
    updateTotalUserScore();
    generateRewardAlgo();
}


function generateRewardAlgo() {        
		//extract the average rewards from the slot machines
		var average_rewards = user_slot_machines.map((d) => d.average_reward)

		//choose slot machine
		var choice = choose_slot_machine(epsilon, 3, average_rewards)

		//generate reward
		var reward = algo_slot_machines[choice].pull_lever()

		//update slot machine parameters
		algo_slot_machines[choice].n_chosen += 1;
		algo_slot_machines[choice].total_reward += reward;
		algo_slot_machines[choice].average_reward = algo_slot_machines[choice].total_reward / algo_slot_machines[choice].n_chosen;

		//update score
		alg_score += reward;
        updateScoresForAlgoMachine(choice+1);
        updateTotalAlgoScore();
        

}

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

