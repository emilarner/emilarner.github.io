/* 
Not going to use classes, since I am not fond of JavaScript, nor am I comfortable with it.
Additionally, this program isn't too complex--as of yet--to warrant such a high-level features.

Really starting to regret it.
*/

const infiniteCampusBackend = "https://infinite-campus-backend.emilarner.repl.co";

var importedGrades = false; 

var gradeStringOn = (window.localStorage.getItem("gradeStringOn") == null) ? false : 
                    window.localStorage.getItem("gradeStringOn");

var criterions = {
    "A": {
        "currentGrades": [],
        "currentAverage": -1
    },
    "B": {
        "currentGrades": [],
        "currentAverage": -1
    },
    "C": {
        "currentGrades": [],
        "currentAverage": -1
    },
    "D": {
        "currentGrades": [],
        "currentAverage": -1
    }
};

const dp_spanish_french_criterions = [
    "E",
    "F",
    "G",
    "H",
    "I"
];


const randomCharacters = "@#%č^&æ*(è)(*ø?&ñ^%$#@ê7ç425ðë9325:~!@#";

var spanish_french_mode_times = 0;
var languageMode = false;

const validCriterions = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

var currentCriterion = "A";

const AD = 4;
const PR = 3.2;
const BA = 2.1;
const MI = 1.1;
const O = 0;

const ADRange = [3.5, 4];
const PRRange = [2.5, 3.499];
const BARange = [1.5, 2.499];
const MIRange = [0.1, 1.499];


const A = [3.40, 4];
/*        ^^^ MPS made an error in their detailing of their standard's based grading algorithm???
Consider having an AD, PR, PR, and another PR.
AD = 4; PR = 3.2
However, the arithmetic mean of {4, 3.2, 3.2, 3.2} is 3.4.
On the document detailing the algorithm, the algorithm does not define a letter grade for 3.4,
since an A ranges from the domain of [3.405, 4.000] and a B ranges from [2.745, 3.390].
Hence, I have adjusted it, which should be mostly correct?
*/


const B = [2.745, 3.390];
const C = [2.145, 2.740];
const D = [1.595, 2.140];
const U = [0.000, 1.590];

const gradeMessages = {
    "A": ["Excellent!", "Very nice... now keep it", "It can't get much better.", "an A."],
    "B": ["Yeah... excellent... sure", "Better than nothing, I guess?", "B"],
    "C": ["Uhh... excellent..?", "Average grade", "It's.... a C!"],
    "D": ["D's get degrees!", "Not very good at all.", "It's a D."],
    "U": ["Short for 'U failed lol xD'", "Failed", "U failed."]
};

const gradeMessagesForLanguage = {
    "A": ["Superhuman", "You did the impossible.", "Impossible."],
    "B": ["Close to superhuman", "What???", "Interesting..."],
    "C": ["Excellent! Basically an A", "Top tier grade", "Relatively an A."],
    "D": ["Try a little harder", "Basically a B", "Kinda like a B"],
    "U": ["Short for 'U failed lol xD'", "Failed, but I don't blame you", "U failed... trying"]
};


function changeLetterGradeMeta(className)
{
    element = document.getElementById("lettergrade-meta");
    element.innerText = `Grade in ${className} is:`;
}

function languageModeGradeColor(grade)
{
    switch (grade)
    {
        case "A":
            return "#FFD700";

        case "B":
            return "#b09504";

        case "C":
            return "green";

        case "D":
            return "orange";

        case "U":
            return "orangered";
    }
}


/* Takes a random element from an array. */
function randomChoice(array)
{
    let arrayLength = array.length;
    return array[Math.floor(Math.random() * arrayLength)];
}

/* Calculate the arithmetic mean of all of the grades in a list. */
function gradeAverage(grades)
{
    let sum = 0;
    for (var i = 0; i < grades.length; i++)
        sum += grades[i];
        
    let average = sum/grades.length;
    return average;
}

/* If a number, x, is within a range of two other numbers. */
function isBetween(x, range)
{
	return range[0] <= x && x <= range[1];
}

/* If a number, x, is within a range of two other numbers, LIKE SO: [a, b) */
function isOpenBetween(x, range)
{
	return range[0] <= x && x <= range[1];
}

/* Using the above function and resources from MPS, determine the final letter grade. */
/* If it is outside of the domain described by MPS, undefined is returned */
/* (This should NOT happen.) */
function old_determineLetterGradeFromAverage(average)
{
    if (isBetween(average, A))
        return "A";
    
    else if (isBetween(average, B))
        return "B";
        
    else if (isBetween(average, C))
        return "C";
        
    else if (isBetween(average, D))
        return "D";
        
    else if (isBetween(average, U))
        return "U";
        
    else
        return undefined; 
}

function determineLetterGradeFromAverage(average)
{
    if (3.405 <= average && average <= 4.000)
        return "A";

    if (2.745 <= average && average < 3.405)
        return "B";

    if (2.145 <= average && average < 2.745)
        return "C";

    if (1.595 <= average && average < 2.145)
        return "D";

    if (0 <= average && average < 1.595)
        return "U";

    return undefined;
}

function determineLetterGradeRaw(crits)
{
    let localSum = 0;
    let numberOfCriterions = 0;

    for (const criterion in crits)
    {
        if (crits[criterion]["currentAverage"] == -1)
            continue;

        localSum += determineCriterionGrade(crits[criterion]["currentAverage"]);
        numberOfCriterions++;
    }

    let average = parseFloat((localSum/numberOfCriterions).toFixed(3));
    return average;
}

/* Given all criterions, calculate averages and display the letter grade. */
function determineLetterGrade(crits)
{
    let average = determineLetterGradeRaw(crits);
    return determineLetterGradeFromAverage(average);
}

/* Turn a numerical criterion grade into its string equivalent. */
function criterionGradeToString(grade)
{
	switch (grade)
    {
        case AD:
            return "AD";
        
        case PR:
            return "PR";
        
        case BA:
            return "BA";
        
        case MI:
            return "MI";
        
        case O:
            return "O";
    }
}

function gradeToString(grade)
{
    switch (grade)
    {
        case 4:
            return "AD";

        case 3:
            return "PR";

        case 2:
            return "BA";

        case 1:
            return "MI";

        case 0:
            return "O";
    }
}

/* Determine the criterion's average grade. Note, it is not as simple as it looks... */
function determineCriterionGrade(average)
{
    if (average == -1)
        return undefined;

    if (isBetween(average, ADRange))
        return AD;

    else if (isBetween(average, PRRange))
        return PR;

    else if (isBetween(average, BARange))
        return BA;

    else if (isBetween(average, MIRange))
        return MI;

    else
        return O;
}


function setCriterionAverage(criterion)
{
    let criterionAverage = criterionGradeToString(
        determineCriterionGrade(criterions[criterion]["currentAverage"]
    ));



    document.getElementById("criterion-grade").innerText = criterionAverage == undefined ? 
                                                            `Average: none yet` : 
                                                            `Average: ${criterionAverage}`;
    
    if (criterionAverage != undefined)
        document.getElementById("criterion-grade").className = `type-${criterionAverage}`;
}

/* Show the grades of the criterion. */
function showGrades(criterion)
{
    /* Clear the fucking grade list. */
    document.getElementById("criterion-grade").className = "";
    document.getElementById("grades").innerHTML = "";

    let currentGrades = criterions[criterion]["currentGrades"];


    /* NULL amount of grades. */
    /* This is buggy, for some reason. */
    if (currentGrades.length == 0)
    {
        document.getElementById("grades").innerHTML = "<h3 style='font-style: italic;'>No Grades To Be Shown</h3>";
    }

    /* Go through all of the grades in the criterion. */ 
    for (let i = 0; i < currentGrades.length; i++)
    {
        let grade = currentGrades[i];
        let gradeString = gradeToString(grade);

        let element = document.createElement("div");


        
        element.className = "border grade type-" + gradeString;
        element.id = (i+1).toString();
        
        element.appendChild(document.createTextNode(gradeString));
        
        document.getElementById("grades").appendChild(element);
    }

    setCriterionAverage(criterion);
}

/* Change the current criterion being operated on, displaying its grades. */
function changeCriterion(crit)
{
    /* This should theoretically never happen; alas, I don't want to risk it. */
    if (!(crit in criterions))
    {
        alert("Critical Error: the criterion you are referencing does not exist...");
        return;
    }

    /* Update the UI. */
    document.getElementById("criterion-name").innerText = `Currently operating on criterion ${crit}:`;
    currentCriterion = crit;
    showGrades(currentCriterion);
}

/* Add a criterion by its letter--without sanity checking--and update the UI. */
function addCriterionByValue(crit)
{
    let newElement = document.createElement("button");
    newElement.onclick = function() { changeCriterion(crit); };
    newElement.className = "criterion-button";
    newElement.innerText = `Criterion ${crit}`;

    criterions[crit] = {
        "currentGrades": [],
        "currentAverage": -1
    };


    document.getElementById("choose-criterions").appendChild(newElement);
}

/* Add a criterion to the grade calculation system by prompting the user.*/
function addCriterion()
{
    let crit = prompt("Enter in the criterion letter: ");

    if (crit.length > 1 || crit.length == 0)
    {
        alert(`'${crit}' is too long for a letter!`);
        return;
    }

    if (!validCriterions.includes(crit))
    {
        alert(
            `Your '${crit}' criterion is not a valid letter (it must be uppercase, without diacritics, and in the Latin alphabet).`
        );
        return;
    }

    if (crit in criterions)
    {
        alert("The criterion already exists, not wasting time by adding it again...");
        return;
    }

    addCriterionByValue(crit);
}

/* Emulates a synchronous sleep() call as found in C and/or Python. */
// taken from https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep bc lazy
function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Automatically adds criterions for DP French or DP Spanish classes. */
/* Also, it has a fun easter egg in it, if you keep abusing it. */
async function dp_spanish_french_mode()
{
    for (let i = 0; i < dp_spanish_french_criterions.length; i++)
    {
        let letter = spanish_french_mode_times < 1 ? 
                    dp_spanish_french_criterions[i] : 
                    randomCharacters[Math.floor(Math.random() * randomCharacters.length)];

        for (let i = 0; i <= spanish_french_mode_times; i++)
            addCriterionByValue(letter);
    }

    spanish_french_mode_times++;

    if (spanish_french_mode_times == 3)
        alert("You've discovered an intentional bug! Good job! Probably you should refresh");

    /* Make it recursively call itself in a loop exponentially faster at this point. */
    /* This may crash your computer, if it lacks the sufficient resources. */
    if (spanish_french_mode_times == 6)
    {
        let initial_time = 2000;
        let decay_constant = .80;

        for (let i = 0; i < 1000; i++)
        {
            dp_spanish_french_mode();
            await sleep(initial_time * Math.pow(decay_constant, i));
        }
    }

    languageMode = true;
}

/* Remove the latest grade from the current criterion, then update the table. */
function popGrade()
{
    document.getElementById(criterions[currentCriterion]["currentGrades"].length.toString()).remove();
    criterions[currentCriterion]["currentGrades"].pop();
    let currentGrades = criterions[currentCriterion]["currentGrades"];
    criterions[currentCriterion]["currentAverage"] = gradeAverage(currentGrades);

    let finalLetterGrade = determineLetterGrade(criterions);
    
    document.getElementById("lettergrade").className = "final-grade type-" + finalLetterGrade; 
    document.getElementById("lettergrade").innerText = finalLetterGrade;

    setCriterionAverage(currentCriterion);
}

/* Add a grade, in numerical format, to the current criterion and calculate averages. */ 
function addGrade(grade)
{
    criterions[currentCriterion]["currentGrades"].push(grade);
    let currentGrades = criterions[currentCriterion]["currentGrades"];
    criterions[currentCriterion]["currentAverage"] = gradeAverage(currentGrades);

    showGrades(currentCriterion);

    let finalLetterGrade = determineLetterGrade(criterions);
    let finalLetterGradeRaw = determineLetterGradeRaw(criterions);

    document.getElementById("lettergrade-raw").innerText = 
                        `Based on the raw score of: ${finalLetterGradeRaw}`;

    document.getElementById("lettergrade").className = "final-grade type-" + finalLetterGrade; 
    document.getElementById("lettergrade").innerText = finalLetterGrade;
    if (languageMode) 
    {
        document.getElementById("lettergrade").style = "color: " + 
                            languageModeGradeColor(finalLetterGrade);
    }

    if (gradeStringOn) 
    {
        let letterGradeText = languageMode ? randomChoice(gradeMessagesForLanguage[finalLetterGrade]) 
                                    : randomChoice(gradeMessages[finalLetterGrade]);


        document.getElementById("lettergrade").title = letterGradeText;
        document.getElementById("lettergrade-text").innerText = letterGradeText;
    }
}


/* Really starting to regret not using classes, but JavaScript is just such a pain... */
/* Procedural programming, while it's good in other languages, is a punishment here. */
/* This is where I really regret also working in a weakly typed, hardly typed language. */
/* Python's type notation, even though it is extremely weak, would greatly help here... */

/* Returns where you can get zeroes and still get the target grade */
function zeroesPossible(criterions, target) // -> object { ... }
{
    /* We need a fresh copy of the criterions to do our statistical analysis. */
    let criterionsClone = structuredClone(criterions);

    let criterionNames = Object.keys(criterionsClone);

    let iterator = 0; 
    
    /* State how many zeroes in which criterions can be taken and still receive target. */
    let result = {

    };

    /* Initialize the result. */
    for (let i = 0; i < criterionNames.length; i++)
        result[criterionNames[i]] = 0;


    let atLeastOne = false;
    while (true)
    {
        /* Cycle, like a clock, around criterions, using modulus! */
        let index = iterator % criterionNames.length;
        
        let currentGrades = criterionsClone[criterionNames[index]]["currentGrades"];

        /* Add a zero to the criterion and calculate its average. */ 
        criterionsClone[criterionNames[index]]["currentGrades"].push(O);
        criterionsClone[criterionNames[index]]["currentAverage"] = gradeAverage(currentGrades);

        /* If the letter grade changes away from our target, break: we're done. */
        if (determineLetterGrade(criterionsClone) != target)
        {
            if (!atLeastOne)
                break;

            /* Try again in the criterions that worked. */
            atLeastOne = false;
            iterator = 0;
            continue;
        }

        atLeastOne = true;

        /* Otherwise, indicate that a zero can be taken, and increment some variables. */
        result[criterionNames[index]]++;
        iterator++;
    }

    return result;
}

function displayZeroesPossible()
{
    alert("Still under construction... you can do this manually for now.");
    return;

    const validGrades = ["A", "B", "C", "D", "U"];
    let targetGrade = prompt("What is your target letter grade?: ");

    if (!validGrades.includes(targetGrade))
    {
        alert(`The grade '${targetGrade}' is not a valid grade.`);
        return;
    }

    let result = zeroesPossible(criterions, targetGrade);
    let message = 
        `You can take the following zeroes in each criterion and still get a grade of ${targetGrade}: \n\n`;

    for (const criterion in result)
    {
        let noZeroes = result[criterion];
        message += `Criterion ${criterion} can take ${noZeroes}\n`;
    }

    alert(message);
}

function exportGrades()
{
    gradeTable = document.getElementById("gradeTable");
    gradeTable.innerHTML = "";

    /* I'm lazy and I don't want to deal with HTML abstractions. */
    /* Who cares if this is inefficient and ugly: it works! */

    let table = "<table class='datatable'>";
    table += "<tr>";
    table += "<th>Criterion</th>";
    table += "<th>Grades</th>";
    table += "</tr>";

    /* Go through each criterion, again! */
    for (let criterion in criterions)
    {
        table += "<tr>";

        //let criterion = criterions.keys()[i];
        let grades = criterions[criterion]["currentGrades"];
        let gradeString = "";

        for (let j = 0; j < grades.length; j++)
            gradeString += criterionGradeToString(grades[j]) + " ";

        table += `<td>${criterion}</td>`;
        table += `<td>${gradeString}</td>`;        

        table += "</tr>";
    }

    table += "</table>";
    gradeTable.innerHTML = table;
}

function isNumeric(str) 
{
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/* Toggles the grade string. */
function toggleGradeStrings()
{
    let opposite = !gradeStringOn;
    window.localStorage.setItem("gradeStringOn", opposite);
}

function standardsToNumbers(standard)
{
    if (standard == "AD")
        return 4;

    if (standard == "PR")
        return 3;

    if (standard == "BA")
        return 2;

    if (standard == "MI")
        return 1;

    if (standard == "O")
        return 0;
}

function fillInGradesHandler(classArray)
{
    let textRepresentation = "";

    for (let i = 0; i < classArray.length; i++)
        textRepresentation += `${i}: ${classArray[i].toString()}`;

    textRepresentation += "99: exit";

    let selection = null;
    let classSelection = null;

    while (true)
    {
        let whichOne = prompt(textRepresentation);

        /* Sanity check. */
        if (!isNumeric(whichOne)) 
        {
            alert(`${whichOne} is not a valid input.`);
            continue;
        }

        /* Exit out of the function. */
        if (whichOne == "99")
            return;

        selection = parseInt(whichOne);

        /* If it's outside of the range. */
        if (!(0 <= selection && selection <= (classArray.length - 1)))
        {
            alert(`${whichOne} is outside of the range of 0-${classArray.length - 1}`);
            continue;
        }

        classSelection = classArray[selection];
        break;
    }

    console.log(classSelection.toString());
    changeLetterGradeMeta(classSelection.name);
    classSelection.getGrades(criterionsTable => {
        let firstCriterion = null;

        console.log(criterionsTable);

        for (const criterion in criterionsTable)
        {
            if (firstCriterion == null)
                firstCriterion = criterion;

            if (!(criterion in criterions))
                addCriterionByValue(criterion);
            
            changeCriterion(criterion);
            let grades = criterionsTable[criterion];

            console.log("Grades: " + grades);

            for (let i = 0; i < grades.length; i++)
            {
                aGrade = grades[i];
                addGrade(standardsToNumbers(aGrade));
            }
        }

        showGrades(firstCriterion);
    });
}

function fillInGrades()
{
    if (importedGrades)
    {
        alert("You've already imported grades. Refresh the page to do it again for a new class.");
        return;
    }


    let infiniteCampus = new InfiniteCampus(infiniteCampusBackend, fillInGradesHandler);

    alert("This is experimental! It is not guaranteed to work, especially with DP French or Spanish!");

    let username = prompt("What's your Infinite Campus username?: ");
    let password = prompt("What's your Infinite Campus password?: ");

    infiniteCampus.login(username, password);
    importedGrades = true;
}