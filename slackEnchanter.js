const GROQ_API_KEY = "YOUR_API_KEY";

function generateIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("tabindex", "-1");
  svg.setAttribute("title", "AutoAwesome");
  svg.style.width = "12px";
  svg.style.height = "12px";
  svg.style.marginRight = "2px";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"
  );

  const isDarkMode = document.querySelector(".sk-client-theme--dark");
  path.setAttribute("fill", isDarkMode ? "white" : "black");

  svg.appendChild(path);
  return svg;
}

const generateMessage = (systemMessage) => {
  const messageElement = document.querySelector("[contenteditable].ql-editor")?.children[0];

  if (!messageElement || !messageElement.innerText.trim()) {
    console.warn("Message element is empty or not found.");
    return;
  }

  const requestData = {
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: messageElement.innerText.trim() },
    ],
    model: "llama3-70b-8192",
  };

  fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const newContent = data?.choices?.[0]?.message?.content;
      if (newContent) {
        messageElement.innerHTML = newContent;
      } else {
        console.warn("No content received in the response.");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

const addButtonsToToolbar = () => {
  const toolbar = document.querySelector(".c-texty_buttons");
  if (!toolbar) return;

  const createButton = (text, systemMessage) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginRight = "10px";

    const button = document.createElement("button");
    button.innerText = text;
    button.style.marginLeft = "5px";

    button.addEventListener("click", () => generateMessage(systemMessage));

    wrapper.appendChild(generateIcon());
    wrapper.appendChild(button);

    return wrapper;
  };

  const correctMessage =
    "Correct all spelling, grammar, and punctuation errors in the following text. Provide the corrected version only, without any additional comments or preambles.";

  const professionalMessage =
    "Rephrase the following message to reflect a formal and professional tone suitable for a corporate setting. Return only the updated text without any prefatory remarks.";

    const translateMessage =
    "Translate the following message to English. Return only the translated text without any prefatory remarks.";

  toolbar.appendChild(createButton("Correct", correctMessage));
  toolbar.appendChild(createButton("Professional", professionalMessage));
  toolbar.appendChild(createButton("Translate", translateMessage));
};

const init = () => {
  const interval = setInterval(() => {
    const toolbar = document.querySelector(".c-texty_buttons");
    if (toolbar) {
      clearInterval(interval);
      addButtonsToToolbar();
    }
  }, 1000);
};

init();
