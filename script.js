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

/* ==========================================
FORM SUBMIT
========================================== */

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const resumeFile =
            document.getElementById("resumeFile").files[0];

        const location =
            document.getElementById("location").value.trim();

        if (!resumeFile) {

            alert("Please upload a resume.");

            return;
        }

        loading.classList.remove("hidden");

        results.classList.add("hidden");

        results.innerHTML = "";

        try {

            console.log("Connecting to Hugging Face...");

            const client =
                await Client.connect(
                    "sid570/CareerMatchAI"
                );

            console.log("Connected");

            console.log(
                await client.view_api()
            );

            console.log("Uploading file...");

            const fileData =
                await handle_file(resumeFile);

            console.log("Sending request...");

            const result =
                await client.predict(
                    "/analyze_resume",
                    {
                        file: fileData,
                        location: location
                    }
                );

            console.log(
                "API Result:",
                result
            );

            let output = "";

            if (
                result &&
                result.data &&
                result.data.length > 0
            ) {

                output = result.data[0];

            } else {

                output =
                    JSON.stringify(
                        result,
                        null,
                        2
                    );

            }

            results.innerHTML = `
                <div class="result-card">
                    <h2>CareerMatch AI Results</h2>
                    <pre class="markdown-output">${output}</pre>
                </div>
            `;

            results.classList.remove(
                "hidden"
            );

        }
        catch (error) {

            console.error(error);

            results.innerHTML = `
                <div class="result-card">
                    <h2>Error</h2>
                    <pre class="markdown-output">
${error.stack || error.message}
                    </pre>
                </div>
            `;

            results.classList.remove(
                "hidden"
            );

        }
        finally {

            loading.classList.add(
                "hidden"
            );

        }

    }
);