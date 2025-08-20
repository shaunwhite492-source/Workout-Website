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

// ===== Wger integration =====
const WGER_API = 'https://wger.de/api/v2';
const ENGLISH_LANG_ID = 2; // English translations in Wger

// Map Wger categories/muscles to YOUR UI categories.
// Your UI categories: Chest, Back, Core, Shoulders, Legs, Biceps, Triceps, Cardio
const CATEGORY_ALIAS = {
  'Abs': 'Core',
  'Abdominals': 'Core',   // just in case
  'Arms': 'Arms',         // we'll split to Biceps/Triceps by muscles
  'Back': 'Back',
  'Calves': 'Legs',
  'Chest': 'Chest',
  'Legs': 'Legs',
  'Shoulders': 'Shoulders',
  'Cardio': 'Cardio'
};

// Wger muscle name → UI category override (used when Wger category is "Arms")
const MUSCLE_TO_UI = {
  'Biceps brachii': 'Biceps',
  'Biceps': 'Biceps',
  'Triceps brachii': 'Triceps',
  'Triceps': 'Triceps'
};

// Simple paginator for Wger (follows ?next= links)
async function fetchAll(url) {
  const out = [];
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Wger API error ' + res.status);
    const data = await res.json();
    out.push(...(data.results || []));
    url = data.next;
  }
  return out;
}

// Get an English name from exerciseinfo
function getEnglishName(info) {
  if (!info.translations) return null;
  const en = info.translations.find(t => t.language === ENGLISH_LANG_ID);
  return en ? en.name : null;
}

// Map a Wger exerciseinfo object to your UI category
function mapToUICategory(info) {
  const raw = info.category?.name || '';
  let uiCat = CATEGORY_ALIAS[raw] || raw || 'Other';

  // Split "Arms" into Biceps/Triceps when possible
  if (uiCat === 'Arms') {
    const muscles = [
      ...(info.muscles || []).map(m => m.name),
      ...(info.muscles_secondary || []).map(m => m.name)
    ];
    const hasBi = muscles.some(n => MUSCLE_TO_UI[n] === 'Biceps');
    const hasTri = muscles.some(n => MUSCLE_TO_UI[n] === 'Triceps');
    if (hasBi && !hasTri) uiCat = 'Biceps';
    else if (hasTri && !hasBi) uiCat = 'Triceps';
    else uiCat = 'Biceps'; // default split for ambiguous "Arms"
  }

  // Normalize to one of your known categories
  const allowed = new Set(['Chest','Back','Core','Shoulders','Legs','Biceps','Triceps','Cardio']);
  if (!allowed.has(uiCat)) {
    // map anything odd to nearest reasonable bucket
    if (uiCat === 'Calves' || uiCat === 'Glutes' || uiCat === 'Hamstrings' || uiCat === 'Quadriceps') return 'Legs';
    return 'Back';
  }
  return uiCat;
}

// Build <option> elements with data-category so your filter keeps working
function populateSelect(selectId, items) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = ''; // clear existing

  items
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.name;                 // your addExercise/addCardio reads .value as the exercise name
      opt.textContent = e.name;
      opt.dataset.category = e.uiCategory; // used by filterAddExercises(...)
      sel.appendChild(opt);
    });
}

// Load Wger → populate #add-exercise and #add-cardio
async function loadWgerCatalog() {
  // exerciseinfo includes category, muscles, and translations (names)
  const infos = await fetchAll(`${WGER_API}/exerciseinfo/?limit=200`);

  const entries = infos.map(info => {
    const name = getEnglishName(info);
    if (!name) return null;
    const uiCategory = mapToUICategory(info);
    return { id: info.id, name, uiCategory };
  }).filter(Boolean);

  // Strength vs Cardio
  const cardio = entries.filter(e => e.uiCategory === 'Cardio');
  const strength = entries.filter(e => e.uiCategory !== 'Cardio');

  populateSelect('add-exercise', strength);
  populateSelect('add-cardio', cardio);

  // After filling the selects, run the current filter once so the first visible option matches the chosen category
  if (document.getElementById('category')) {
    filterAddExercises('category', 'add-exercise');
  }
}

// ===== small updates to your existing functions =====

// Use the unique cardio day select id
const originalAddCardio = (typeof addCardio === 'function') ? addCardio : null;
function addCardio() {
  const daySel = document.getElementById('add-day-cardio'); // changed from 'add-day'
  const day = daySel ? daySel.value : document.getElementById('add-day').value; // fallback just in case

  const exerciseSel = document.getElementById('add-cardio');
  const exerciseName = exerciseSel.value;
  const category = exerciseSel.options[exerciseSel.selectedIndex].dataset.category || 'Cardio';
  const hours = document.getElementById('add-hours').value;
  const minutes = document.getElementById('add-minutes').value;

  if (workoutPlan[day]) {
    workoutPlan[day].push({ exercise: exerciseName, time: `${hours}h ${minutes}m`, category });
    displayWorkoutPlan();
  } else {
    alert("Invalid day of the week!");
  }
}

// Replace your window.onload with this (so we load Wger first)
window.addEventListener('load', async () => {
  try {
    await loadWgerCatalog();
  } catch (e) {
    console.error(e);
    // If Wger is unreachable (offline/CORS), your hardcoded options still work.
  }
  displayWorkoutPlan();
  document.querySelector('.tab-button')?.click();
});

