/* 
Not going to use classes, since I am not fond of JavaScript, nor am I comfortable with it.
Additionally, this program isn't too complex--as of yet--to warrant such a high-level features.

Really starting to regret it.
*/

/* make sure there is no trailing / vvvv */
const infiniteCampusBackend = "https://infinite-campus-backend.emilarner.repl.co";
const infiniteCampus = new InfiniteCampus(infiniteCampusBackend, fillInGradesHandler);

var noGradesDialog = null;
var classSelectionDialog = null;
var loginDialog = null;
var errorDialog = null;

var currentWaitTime = 0;
var currentWaitTimeInterval = null;

var waitDialog = null;
var canvas = null;
var context = null;

const minute = 60;

var classesCache = null;
var tokenCache = null;
var tokenCacheExpiry = 3 * minute;

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

var criterionCopy = null;
var blankCriterions = structuredClone(criterions);

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


function clearGrades()
{
    criterions = structuredClone(blankCriterions);

    changeCriterion("A");
    showGrades(currentCriterion);
    showLetterGrade();
}

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
    if (grades.length == 0)
        return -1;

    let sum = 0;
    for (let i = 0; i < grades.length; i++)
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
        
        element.className = `border grade type-${gradeString}`;
        element.id = (i+1).toString();
        element.title = "Click to remove this grade.";
        element.onclick = popGradeByID;
        
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

function popGradeSanityCheck()
{
    if (criterions[currentCriterion]["currentGrades"].length == 0)
        criterions[currentCriterion]["currentAverage"] = -1;
}

function popGradeByID(event)
{
    let id = parseInt(event.target.id) - 1;
    document.getElementById((id + 1).toString()).remove();

    let currentGrades = criterions[currentCriterion]["currentGrades"];
    let item = criterions[currentCriterion]["currentGrades"][id];
    
    criterions[currentCriterion]["currentGrades"].splice(id, 1);


    criterions[currentCriterion]["currentAverage"] = gradeAverage(
        criterions[currentCriterion]["currentGrades"]
    );

    let finalLetterGrade = determineLetterGrade(criterions);
    
    document.getElementById("lettergrade").className = "final-grade type-" + finalLetterGrade; 
    document.getElementById("lettergrade").innerText = finalLetterGrade;

    setCriterionAverage(currentCriterion);
    showGrades(currentCriterion);
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
    showGrades(currentCriterion);
}

function letterGradeText(rawScore, letterGrade)
{
    document.getElementById("lettergrade-raw").innerText = 
    `Based on the raw score of: ${rawScore}`;

    
    document.getElementById("lettergrade").className = "final-grade type-" + letterGrade; 
    document.getElementById("lettergrade").innerText = letterGrade;

    if (languageMode) 
    {
        document.getElementById("lettergrade").style = "color: " + 
                            languageModeGradeColor(letterGrade);
    }
}

function showLetterGrade()
{
    let finalLetterGrade = determineLetterGrade(criterions);
    if (finalLetterGrade == undefined)
    {
        letterGradeText("0.00", "", "Nothing here!");
        return;
    }


    let finalLetterGradeRaw = determineLetterGradeRaw(criterions);

    letterGradeText(finalLetterGradeRaw, finalLetterGrade);
}

/* Add a grade, in numerical format, to the current criterion and calculate averages. */ 
function addGrade(grade)
{
    criterions[currentCriterion]["currentGrades"].push(grade);
    let currentGrades = criterions[currentCriterion]["currentGrades"];
    criterions[currentCriterion]["currentAverage"] = gradeAverage(currentGrades);

    showGrades(currentCriterion);
    showLetterGrade();
}

/* Export the grades to a table. VERY shitty code. */
function exportGrades()
{
    gradeTable = document.getElementById("gradeTable");
    gradeTable.innerHTML = "";

    /* I'm lazy and I don't want to deal with HTML abstractions. */
    /* Who cares if this is inefficient and ugly: it works! */

    let table = "<table class='datatable'>";
    table += "<tr>";
    table += "<th>Criterion</th>";
    table += "<th>Criterion Avg.</th>"
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
            gradeString += gradeToString(grades[j]) + " ";

        table += `<td>${criterion}</td>`;
        table += `<td>${gradeToString(determineCriterionGrade(criterions[criterion]["currentAverage"]))}</td>`;
        table += `<td>${gradeString}</td>`;        

        table += "</tr>";
    }

    table += "</table>";
    gradeTable.innerHTML = table;
}

/* yanked from stackoverflow or whyatever */
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

/* No switch required, does performance even matter? */
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

function classDialogSelect(index)
{
    classSelectionDialog.close();
    let classSelection = classesCache[index];

    changeLetterGradeMeta(classSelection.name);
    classSelection.getGrades(criterionsTable => {
        let firstCriterion = null;

        for (const criterion in criterionsTable)
        {
            if (firstCriterion == null)
                firstCriterion = criterion;

            if (!(criterion in criterions))
                addCriterionByValue(criterion);
            
            changeCriterion(criterion);
            let grades = criterionsTable[criterion];

            for (let i = 0; i < grades.length; i++)
            {
                aGrade = grades[i];
                addGrade(standardsToNumbers(aGrade));
            }
        }

        showGrades(firstCriterion);
        showLetterGrade();

        /* A copy of the criterions table, for resetting usage. */
        criterionCopy = structuredClone(criterions);
    });
}

function classDialogManager(classArray)
{
    /* yes, we're doing this again! */
    let finalHTML = "<h1>Please select a class to pull grades from: </h1>";
    for (let i = 0; i < classArray.length; i++)
    {
        /* Remove any ACP results--they mean nothing! */
        if (classArray[i].name.includes("ACADEMIC CAREER PLAN"))
            continue;

        finalHTML += `<div class="class-selection" onclick="classDialogSelect(${i});"><h3><a>${classArray[i].name}</a></h3></div>`;
    }
    
    /* Set the HTML of the dialog and show it. Beautiful code! */
    classSelectionDialog.innerHTML = finalHTML;
    classSelectionDialog.showModal();
}

function fillInGradesHandler(classArray)
{
    waitDialogClose();

    classesCache = classArray;
    tokenCache = new Token(classArray[0].token);
    classDialogManager(classArray);
}

function displayError(msg, loginError = false)
{
    document.getElementById("error-msg").innerText = msg;
    errorDialog.showModal();

    if (loginError)
        waitDialogClose();
}


/* Clear a canvas, making it all black. */
/*function clearCanvas(canvas, canvasContext)
{
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
}
*/

function waitDialogClose()
{
    clearInterval(waitDialogInterval);
    clearInterval(currentWaitTimeInterval);
    waitDialog.close();
}

function waitDialogOpen(timer = 0)
{
    canvas.addEventListener("click", change_angle);

    context = canvas.getContext("2d");
    context.strokeStyle = "green";
    waitDialog.showModal();

    if (timer != 0)
    {
        currentWaitTime = timer;
        document.getElementById("wait-dialog-seconds").innerText = `Cool Down: Waiting... ${timer} seconds`;
        currentWaitTimeInterval = setInterval(() => {
            currentWaitTime--;
            if (currentWaitTime == 0)
                waitDialogClose();

            document.getElementById("wait-dialog-seconds").innerText = `Cool Down: Waiting... ${currentWaitTime} seconds`;
        }, 1000);
    }

    waitDialogInterval = setInterval(
        Math.floor(Math.random() * 2 ) == 0 ? do_shit : do_shit_pyramid,
        25
    );


}

function loginDialogSignIn()
{
    loginDialog.close();
    importedGrades = true;

    let username = document.getElementById("ic-username").value;
    let password = document.getElementById("ic-password").value;
    let captcha = grecaptcha.getResponse();
    console.log(captcha);

    waitDialogOpen();

    infiniteCampus.login(username, password, captcha, ic => {
        displayError("Invalid credentials for " + ic.username, true);
    }, err => {
        displayError(err, true);
    }, (invite, number) => {
        
        /* This user is not invited. */
        if (invite == null)
        {
            document.getElementById("invitation-information").innerHTML = 
                "You are not invited! Click <a href='invitations.html'>here</a> for more information.";
            return;
        }

        document.getElementById("invitation-information").innerText
         = `Your invitation code: ${invite}`;
    });
}

function fillInGrades()
{
    clearGrades();

    /* If we are able to used cached login information. */
    if (tokenCache != null && !tokenCache.isExpired(tokenCacheExpiry) && classesCache != null)
    {
        fillInGradesHandler(classesCache);
        return;
    }

    document.getElementById("authentication-ic-login").addEventListener("click", loginDialogSignIn);

    loginDialog.showModal();

    /* Allow the enter key to be used for signing in. */
    loginDialog.addEventListener("keyup", (e) => {
        /* Enter key. */
        if (e.keyCode == 13)
            loginDialogSignIn();
    });
}

function randomColor()
{
    return Math.floor(Math.random() * 16777215).toString(16);
}

function randomColorIntro()
{
    document.getElementById("intro").style.color = randomColor();
}

function oldGrades()
{
    if (criterionCopy == null)
    {
        noGradesDialog.showModal();
        return;
    }

    criterions = structuredClone(criterionCopy);
    showGrades(currentCriterion);
    showLetterGrade();
}