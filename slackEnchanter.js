const GROQ_API_KEY = "";

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

const generateMessage = async (systemMessage) => {
  const messageInput = document.querySelector("[data-qa='message_input']");
  const richTextInput = messageInput.querySelector('[contenteditable="true"]');
  if (!richTextInput) {
    console.log('Rich text input not found');
    return;
  }

  const text = richTextInput.textContent;
  if (!text) {
    alert('Please enter some text first');
    return;
  }

  try {
    chrome.storage.sync.get(['groqApiKey'], async function(result) {
      if (!result.groqApiKey) {
        alert('Please set your GROQ API key in the extension settings');
        return;
      }

      const originalText = text;
      richTextInput.textContent = "Generating...";

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${result.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              {
                role: "system",
                content: systemMessage
              },
              {
                role: "user",
                content: text
              }
            ],
            temperature: 0.5,
            max_tokens: 1024
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        // Update the rich text input
        richTextInput.textContent = generatedText;
        
        // Create and dispatch necessary events to update Slack's internal state
        const inputEvent = new InputEvent('input', { bubbles: true });
        richTextInput.dispatchEvent(inputEvent);
        
        // Create a keyboard event to simulate typing
        const keyEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Process',
          code: 'Process'
        });
        richTextInput.dispatchEvent(keyEvent);
        
        // Focus the input to ensure Slack recognizes the change
        richTextInput.focus();

      } catch (error) {
        console.error('Error:', error);
        richTextInput.textContent = originalText;
        alert('Error generating message. Please check your API key and try again.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Error accessing storage. Please try again.');
  }
};

const addButtonsToToolbar = () => {
  const toolbar = document.querySelector(".c-texty_buttons");
  if (!toolbar) return;

  // Remove any existing enchanter buttons
  const existingButtons = toolbar.querySelectorAll(".enchanter-button");
  existingButtons.forEach(button => button.remove());

  chrome.storage.sync.get(['customButtons'], function(result) {
    const buttons = result.customButtons || [];
    
    const createButton = (text, prompt) => {
      const wrapper = document.createElement("div");
      wrapper.className = "enchanter-button";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.marginRight = "10px";

      const button = document.createElement("button");
      button.innerText = text;
      button.className = "c-button-unstyled c-texty_button";
      button.style.padding = "0 8px";
      button.style.height = "26px";
      button.style.minWidth = "36px";
      button.style.borderRadius = "4px";
      button.style.fontSize = "13px";
      button.style.fontWeight = "bold";
      button.style.backgroundColor = "#ffffff";
      button.style.border = "1px solid #dddddd";
      button.style.cursor = "pointer";

      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        generateMessage(prompt);
      };

      wrapper.appendChild(button);
      return wrapper;
    };

    buttons.forEach(btn => {
      toolbar.appendChild(createButton(btn.text, btn.prompt));
    });
  });
};

// Update the observer to be more specific
const observer = new MutationObserver((mutations) => {
  const toolbar = document.querySelector(".c-texty_buttons");
  if (toolbar && !toolbar.querySelector(".enchanter-button")) {
    addButtonsToToolbar();
    // Disconnect and reconnect the observer to prevent multiple triggers
    observer.disconnect();
    setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 1000);
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial check for toolbar
if (document.querySelector(".c-texty_buttons")) {
  addButtonsToToolbar();
}
