let workoutPlan = {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
};

function displayWorkoutPlan(filteredCategory = 'all') {
            let displayElement = document.getElementById('workout-plan-display');
            displayElement.innerHTML = ''; // Clear previous content

            for (let day in workoutPlan) {
                // Create and append the day header
                let dayHeader = document.createElement('h3');
                dayHeader.textContent = day;
                displayElement.appendChild(dayHeader);

                // Create the list of exercises
                let exerciseList = document.createElement('ul');

                if (workoutPlan[day].length > 0) {
                    workoutPlan[day].forEach((exercise, index) => {
                        let exerciseItem = document.createElement('li');
                        exerciseItem.classList.add('exercise-item');
                        
                        if ((filteredCategory === 'all') || (exercise.category === filteredCategory)) {
                            if (exercise.sets && exercise.reps) {
                                exerciseItem.innerHTML = `${exercise.exercise} - ${exercise.sets} x ${exercise.reps}`;
                            } else if (exercise.time) {
                                exerciseItem.innerHTML = `${exercise.exercise} - ${exercise.time}`;
                            }
                            
                            let closeButton = document.createElement('span');
                            closeButton.textContent = '×';
                            closeButton.classList.add('close-button');
                            closeButton.onclick = function() {
                                removeExercise(day, index);
                            };

                            exerciseItem.appendChild(closeButton);
                            exerciseList.appendChild(exerciseItem);
                        }
                    });
                } else {
                    // If there are no exercises, display a message
                    let noExerciseItem = document.createElement('li');
                    noExerciseItem.textContent = 'No exercises';
                    exerciseList.appendChild(noExerciseItem);
                }

                displayElement.appendChild(exerciseList);
            }
        }

        function removeExercise(day, index) {
            workoutPlan[day].splice(index, 1);
            displayWorkoutPlan();
        }



function addExercise() {
    let day = document.getElementById('add-day').value;
    let exercise = document.getElementById('add-exercise');
    let exerciseName = exercise.value;
    let category = exercise.options[exercise.selectedIndex].dataset.category;
    let sets = document.getElementById('add-sets').value;
    let reps = document.getElementById('add-reps').value;

    if (workoutPlan[day]) {
        workoutPlan[day].push({ exercise: exerciseName, sets: sets, reps: reps, category: category });
        displayWorkoutPlan();
    } else {
        alert("Invalid day of the week!");
    }
}

function addCardio() {
    let day = document.getElementById('add-day').value;
    let exercise = document.getElementById('add-cardio');
    let exerciseName = exercise.value;
    let category = exercise.options[exercise.selectedIndex].dataset.category;
    let hours = document.getElementById('add-hours').value;
    let minutes = document.getElementById('add-minutes').value;

    if (workoutPlan[day]) {
        workoutPlan[day].push({ exercise: exerciseName, time: `${hours}h ${minutes}m`, category: category });
        displayWorkoutPlan();
    } else {
        alert("Invalid day of the week!");
    }
}

function resetExercises() {
    Object.keys(workoutPlan).forEach(day => {
        workoutPlan[day] = [];
    });
    displayWorkoutPlan();
}

function printWorkoutPlan() {
    const printContents = document.getElementById('workout-plan-display').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    location.reload();
}

function openTab(evt, tabName) {
    var i, tabContent, tabButton;

    // Hide all tab content
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    // Remove the 'active' class from all buttons
    tabButton = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButton.length; i++) {
        tabButton[i].className = tabButton[i].className.replace(" active", "");
    }

    // Show the current tab and add 'active' class to the button
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function filterAddExercises(categorySelectId, exerciseSelectId) {
    let category = document.getElementById(categorySelectId).value;
    let exerciseSelect = document.getElementById(exerciseSelectId);
    let options = exerciseSelect.getElementsByTagName('option');

    let firstVisibleOption = null;
    
    for (let i = 0; i < options.length; i++) {
        if (category === 'all' || options[i].dataset.category === category) {
            options[i].style.display = '';
            if (firstVisibleOption === null) {
                firstVisibleOption = options[i];
            }
        } else {
            options[i].style.display = 'none';
        }
    }
    
    if (firstVisibleOption) {
        exerciseSelect.value = firstVisibleOption.value;
    }
}

// Initially display the workout plan and open the first tab
window.onload = function() {
    displayWorkoutPlan();
    document.querySelector('.tab-button').click();
};



