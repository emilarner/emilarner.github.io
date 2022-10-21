/* Really starting to regret not using classes, but JavaScript is just such a pain... */
/* Procedural programming, while it's good in other languages, is a punishment here. */
/* This is where I really regret also working in a weakly typed, hardly typed language. */
/* Python's type notation, even though it is extremely weak, would greatly help here... */

/* Returns where you can get zeroes and still get the target grade (in enum format) */
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

    while (true)
    {
        /* Cycle, like a clock, around criterions, using modulus! */
        let index = criterionNames.length % iterator; 
        let currentGrades = criterionsClone[criterionNames[i]]["currentGrades"];

        /* Add a zero to the criterion and calculate its average. */ 
        criterionsClone[criterionNames[i]]["currentGrades"].push(O);
        criterionsClone[criterionNames[i]]["currentAverage"] = gradeAverage(currentGrades);

        /* If the letter grade changes away from our target, break: we're done. */
        if (determineLetterGrade(criterionsClone) != target)
            break;

        /* Otherwise, indicate that a zero can be taken, and increment some variables. */
        result[criterionNames[i]]++;
        iterator++;
    }

    return result;
}
