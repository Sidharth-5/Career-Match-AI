import {
    Client,
    handle_file
} from "https://cdn.jsdelivr.net/npm/@gradio/client/+esm";

/* ==========================================
ELEMENTS
========================================== */

const form =
    document.getElementById("resumeForm");

const loading =
    document.getElementById("loading");

const results =
    document.getElementById("results");

const jobMatches =
    document.getElementById("jobMatches");

const jobGrid =
    document.getElementById("jobGrid");

const jobCount =
    document.getElementById("jobCount");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const loadingText =
    document.getElementById("loadingText");

/* ==========================================
LOADING MESSAGES
========================================== */

const loadingMessages = [

    "Reading your resume...",

    "Extracting technical skills...",

    "Analyzing experience level...",

    "Identifying career opportunities...",

    "Matching jobs to your profile...",

    "Calculating compatibility scores...",

    "Searching for openings...",

    "Comparing skills with job requirements...",

    "Preparing your career report...",

    "Almost done..."
];

let loadingInterval;

/* ==========================================
HELPERS
========================================== */

function showError(message){

    errorMessage.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}

function hideError(){

    errorBox.classList.add(
        "hidden"
    );
}

function createTag(text){

    return `
        <span class="tag">
            ${text}
        </span>
    `;
}

function createList(list, id){

    const element =
        document.getElementById(id);

    element.innerHTML = "";

    list.forEach(role => {

        const option =
            document.createElement("option");

        option.value = role;
        option.textContent = role;

        element.appendChild(option);

    });

}

function getMatchClass(score){

    if(score >= 70)
        return "match-high";

    if(score >= 40)
        return "match-medium";

    return "match-low";
}

function animateCounter(
    element,
    end
){

    let current = 0;

    const step =
        Math.max(
            1,
            Math.ceil(end / 20)
        );

    const timer =
        setInterval(()=>{

            current += step;

            if(current >= end){

                current = end;

                clearInterval(
                    timer
                );
            }

            element.textContent =
                `${current} Jobs Found`;

        },50);
}

/* ==========================================
RENDER JOBS
========================================== */

function renderJobs(jobs){

    if(!jobs.length){

        jobMatches.classList.add(
            "hidden"
        );

        return;
    }

    jobGrid.innerHTML = "";

    animateCounter(
        jobCount,
        jobs.length
    );

    jobs.forEach(
        (job,index)=>{

        const card =
            document.createElement("div");

        card.className =
            "col-lg-4 col-md-6";

        card.style.opacity = 0;

        card.style.transform =
            "translateY(20px)";

        card.innerHTML = `

        <div class="job-card">

            <div class="job-title">
                ${job.title}
            </div>

            <div class="
                match-badge
                ${getMatchClass(job.match)}
            ">
                ${job.match}% Match
            </div>

            <div class="job-company">
                🏢 ${job.company}
            </div>

            <div class="job-location">
                📍 ${job.location}
            </div>

            <div class="skill-list">

                ${
                    job.skills
                    .map(skill => `
                        <span class="skill-chip">
                            ${skill}
                        </span>
                    `)
                    .join("")
                }

            </div>

            <a
                href="${job.url}"
                target="_blank"
                class="apply-btn"
            >
                Apply Now
            </a>

        </div>
        `;

        jobGrid.appendChild(card);

        setTimeout(()=>{

            card.style.transition =
                "all 0.5s ease";

            card.style.opacity = 1;

            card.style.transform =
                "translateY(0)";

        },index * 150);

    });

    jobMatches.classList.remove(
        "hidden"
    );
}

/* ==========================================
PARSE AI RESPONSE
========================================== */

function parseResponse(text){

    const data = {

        field:"",
        seniority:"",
        skills:[],
        jobs:[],
        matches:[]
    };

    const fieldMatch =
        text.match(
            /\*\*Field:\*\*\s*(.*)/i
        );

    if(fieldMatch)
        data.field =
            fieldMatch[1];

    const seniorityMatch =
        text.match(
            /\*\*Seniority.*?\*\*\s*(.*)/i
        );

    if(seniorityMatch)
        data.seniority =
            seniorityMatch[1];

    const skillsMatch =
        text.match(
            /\*\*Skills:\*\*\s*(.*)/i
        );

    if(skillsMatch){

        data.skills =
            skillsMatch[1]
            .split(",")
            .map(
                s=>s.trim()
            );
    }

    const jobsMatch =
        text.match(
            /\*\*Suitable Jobs:\*\*\s*(.*)/i
        );

    if(jobsMatch){

        data.jobs =
            jobsMatch[1]
            .split(",")
            .map(
                s=>s.trim()
            );
    }

    const sections =
        text.split("### ");

    sections.forEach(
        section=>{

        const titleMatch =
            section.match(
                /(.*?)\s+[-—]\s+(\d+)%/
            );

        const companyMatch =
            section.match(
                /\*\*Company:\*\*\s*(.*)/i
            );

        const locationMatch =
            section.match(
                /\*\*Location:\*\*\s*(.*)/i
            );

        const skillsMatch =
            section.match(
                /\*\*Matched Skills:\*\*\s*(.*)/i
            );

        const urlMatch =
            section.match(
                /\((https?:\/\/.*?)\)/
            );

        if(
            titleMatch &&
            companyMatch
        ){

            data.matches.push({

                title:
                    titleMatch[1]
                    .trim(),

                match:
                    parseInt(
                        titleMatch[2]
                    ),

                company:
                    companyMatch[1]
                    .trim(),

                location:
                    locationMatch
                    ? locationMatch[1]
                    : "Not specified",

                skills:
                    skillsMatch
                    ? skillsMatch[1]
                        .split(",")
                        .map(
                            s=>s.trim()
                        )
                    : [],

                url:
                    urlMatch
                    ? urlMatch[1]
                    : "#"

            });

        }

    });

    return data;
}

/* ==========================================
DISPLAY RESULTS
========================================== */

function displayResults(data){

    document.getElementById(
        "field"
    ).textContent =
        data.field;

    document.getElementById(
        "seniority"
    ).textContent =
        data.seniority;

    document.getElementById(
        "skills"
    ).innerHTML =
        data.skills
            .map(createTag)
            .join("");

    createList(
        data.jobs,
        "jobs"
    );

    renderJobs(
        data.matches
    );

    results.classList.remove(
        "hidden"
    );

    results.animate([
        {
            opacity:0,
            transform:
            "translateY(20px)"
        },
        {
            opacity:1,
            transform:
            "translateY(0)"
        }
    ],{
        duration:600
    });

    results.scrollIntoView({
        behavior:"smooth"
    });

}

/* ==========================================
SUBMIT
========================================== */

form.addEventListener(
"submit",
async(e)=>{

    e.preventDefault();

    hideError();

    const file =
        document
        .getElementById(
            "resumeFile"
        )
        .files[0];

    const location =
        document
        .getElementById(
            "location"
        )
        .value
        .trim();

    if(!file){

        showError(
            "Please upload a resume."
        );

        return;
    }

    loading.classList.remove(
        "hidden"
    );

    results.classList.add(
        "hidden"
    );

    jobMatches.classList.add(
        "hidden"
    );

    let index = 0;

    loadingText.textContent =
        loadingMessages[0];

    loadingInterval =
        setInterval(()=>{

            index =
                (index + 1)
                % loadingMessages.length;

            loadingText.animate([
                {
                    opacity:0
                },
                {
                    opacity:1
                }
            ],{
                duration:300
            });

            loadingText.textContent =
                loadingMessages[index];

        },2500);

    try{

        const client =
            await Client.connect(
                "sid570/CareerMatchAI"
            );

        const uploadedFile =
            await handle_file(file);

        const result =
            await client.predict(
                "/analyze_resume",
                {
                    file:
                        uploadedFile,

                    location:
                        location
                }
            );

        const output =
            result.data[0];

        const parsed =
            parseResponse(
                output
            );

        displayResults(
            parsed
        );

    }
    catch(error){

        console.error(
            error
        );

        showError(
            error.message
        );

    }
    finally{

        clearInterval(
            loadingInterval
        );

        loading.classList.add(
            "hidden"
        );
    }

});

