/* Let us take a moment to say: GOD FUCKING DAMN FUCKING STUPID CORS!!!!!! */

async function postData(url = '', data = {}) 
{
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'content-type': 'text/plain'
        //'Content-Type': 'application/x-www-form-urlencoded'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    
    return response.text(); // parses JSON response into native JavaScript objects
}

const gradeValues = {
    AD: 4,
    PR: 3,
    BA: 2,
    MI: 1,
    O: 0
};


class Class
{
    constructor(endpoint, token, id, name)
    {
        this.token = token;
        this.endpoint = endpoint;
        this.id = id;
        this.name = name;
    }

    /* Get an array of Criterion(s) with all grades. */
    getGrades(callBack)
    {
        console.log(`${this.name}: ${this.id}`);

        postData(`${this.endpoint}/get-grades/${this.id}/`, {
            "token": this.token
        }).then(text => {
            let json = JSON.parse(text);

            let grades = JSON.parse(json["grades"]);
            let criterions = JSON.parse(json["criterions"]);

            let criterionTable = {

            };

            let id2criterion = {

            };

        

            /* Go through every criterion. We need to get its ID so we can use it */
            /* to correlate that ID with each criterion object. */
            for (let i = 0; i < criterions["details"].length; i++)
            {
                /* Make this easier to work with. */
                let criterion = criterions["details"][i];
                let task = criterion["task"];
                let taskName = task["taskName"];

                /* It's not a criterion, so skip it. */
                /* This could be optimized: criterions are usually first, so we could */
                /* just break. BUT, I'm not sure if it's guaranteed. */
                if (!taskName.startsWith("Criterion"))
                    continue;
                
                
        

                let criterionName = taskName.split("Criterion ")[1].split(":")[0];
                let criterionID = task["taskID"];

                id2criterion[criterionID] = criterionName;
                criterionTable[criterionName] = [];
            }

            /* Go through each grade now, so we can correlate it via criterion. */
            /* Then, add it to the criterion's array. */
            for (let i = 0; i < grades.length; i++)
            {
                let grade = grades[i];
                let score = grade["score"];

                /* Null scores means the teacher didn't grade it yet. */
                if (score == null)
                    continue;

                let taskID = grade["taskID"];
                let hasMultipleScores = grade["hasMultipleScores"]

                /* Do shit normally. */
                if (!hasMultipleScores) 
                {
                    let tmpCriterionTable = {

                    };

                    tmpCriterionTable[id2criterion[taskID]] = [score];
                    //criterionTable[id2criterion[taskID]].push(score);
                    callBack(tmpCriterionTable);
                    continue;
                }

                let sectionID = grade["objectSectionID"];
                postData(`${this.endpoint}/get-multiple-grades/${sectionID}/`, {
                    "token": this.token
                }).then(text => {
                    let json = JSON.parse(text);
                    let scores = json["scores"];
                    let gradingAlignments = json["gradingAlignments"];




                    /* Go through each score. */
                    for (let j = 0; j < scores.length; j++)
                    {
                        let tmpCriterionTable = {};
                        let criterionID = gradingAlignments[j]["taskID"];
                        let score = scores[j];
                        let scoreGrade = score["score"];

                        tmpCriterionTable[id2criterion[criterionID]] = [scoreGrade];
                        callBack(tmpCriterionTable);
                        console.log(`Score Grade: ${scoreGrade}`);
                        //criterionTable[id2criterion[criterionID]].push(scoreGrade);
                    }

                    
                    //callBack(criterionTable);
                });
            }

            /* Give this data to our event handler callback function... */
            /* because... you know, JavaScript! */

            //callBack(criterionTable);
        })
    }

    toString()
    {
        return `${this.name} (ID: ${this.id})\n`;
    }
}

class InfiniteCampus
{
    constructor(endpoint, onClasses)
    {
        this.endpoint = endpoint;
        this.token = "";
        this.classes = [];
        this.onClasses = onClasses;
    }


    onLogin(tok)
    {
        //this.token = tok;
        this.getClasses(tok);
    }

    /* Login to infinite campus, and store the necessary site keys. */
    login(username, password)
    {
        this.username = username;

        postData(`${this.endpoint}/login/`, {
            "username": username,
            "password": password
        }).then((token) => {
            this.token = token;
            this.getClasses();
        });
    }

    processGetClasses(text)
    {
        json = JSON.parse(text);
    }

    /* Get an index of all classes. Returns an array of Class objects. */
    getClasses()
    {
        postData(`${this.endpoint}/get-classes/${this.username}/`, {
            "token": this.token
        }).then(text => {
            let data = JSON.parse(text);

            for (let i = 0; i < data[0].courses.length; i++)
            {
                let course = data[0].courses[i];
                let classObj = new Class(
                    this.endpoint,
                    this.token, 
                    course["sectionID"], 
                    course["courseName"]
                );

                this.classes.push(classObj);
            }

            /* Call the event handler. */ 
            this.onClasses(this.classes);
        });
    }
}

/*
var inf = new InfiniteCampus(
    "https://infinite-campus-backend.emilarner.repl.co", 
    aClass => {
        let oneClass = aClass[0];
        console.log(oneClass.toString());

        oneClass.getGrades(criterionsMap => {
            console.log(criterionsMap);
        });
    }
);

inf.login("s8931370", "09/02/05");
*/
