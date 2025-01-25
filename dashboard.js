const DEFAULT_BUTTONS = [
    {
        id: 'correct',
        text: "Correct",
        prompt: "Correct all spelling, grammar, and punctuation errors in the following text. Provide the corrected version only, without any additional comments or preambles.",
        isDefault: true,
        defaultText: "Correct",
        defaultPrompt: "Correct all spelling, grammar, and punctuation errors in the following text. Provide the corrected version only, without any additional comments or preambles."
    },
    {
        id: 'professional',
        text: "Professional",
        prompt: "Rephrase the following message to reflect a formal and professional tone suitable for a corporate setting. Return only the updated text without any prefatory remarks.",
        isDefault: true,
        defaultText: "Professional",
        defaultPrompt: "Rephrase the following message to reflect a formal and professional tone suitable for a corporate setting. Return only the updated text without any prefatory remarks."
    },
    {
        id: 'translate',
        text: "Translate",
        prompt: "Translate the following message to English. Return only the translated text without any prefatory remarks.",
        isDefault: true,
        defaultText: "Translate",
        defaultPrompt: "Translate the following message to English. Return only the translated text without any prefatory remarks."
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeButtons().then(() => {
        loadButtons();
        loadApiKey();
        addRestoreDefaultsSection();
    });
    
    document.getElementById('addButton').addEventListener('click', addNewButton);
    document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
});

async function initializeButtons() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['customButtons'], function(result) {
            if (!result.customButtons) {
                // Initialize with default buttons if no buttons exist
                chrome.storage.sync.set({ customButtons: DEFAULT_BUTTONS }, resolve);
            } else {
                // Check if default buttons exist, add any missing ones
                let buttons = result.customButtons;
                let modified = false;
                
                DEFAULT_BUTTONS.forEach(defaultBtn => {
                    if (!buttons.some(btn => btn.id === defaultBtn.id)) {
                        buttons.push(defaultBtn);
                        modified = true;
                    }
                });

                if (modified) {
                    chrome.storage.sync.set({ customButtons: buttons }, resolve);
                } else {
                    resolve();
                }
            }
        });
    });
}

function loadApiKey() {
    chrome.storage.sync.get(['groqApiKey'], function(result) {
        if (result.groqApiKey) {
            document.getElementById('groqApiKey').value = result.groqApiKey;
        }
    });
}

function saveApiKey() {
    const apiKey = document.getElementById('groqApiKey').value.trim();
    chrome.storage.sync.set({ groqApiKey: apiKey }, function() {
        alert('API key saved successfully!');
    });
}

function loadButtons() {
    const buttonList = document.querySelector('.button-list');
    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        buttonList.innerHTML = '';
        
        buttons.forEach((btn, index) => {
            const buttonElement = document.createElement('div');
            buttonElement.className = 'button-item';
            
            const resetButton = btn.isDefault ? 
                `<span class="reset-btn" data-index="${index}">Reset</span>` : '';

            buttonElement.innerHTML = `
                <div>
                    <strong>${btn.text}</strong>
                    ${btn.isDefault ? ' <span class="default-badge">Default</span>' : ''}
                    <div class="button-controls">
                        <span class="edit-btn" data-index="${index}">Edit</span>
                        ${resetButton}
                        <span class="delete-btn" data-index="${index}">Delete</span>
                    </div>
                </div>
                <p class="prompt-text">${btn.prompt}</p>
                <div class="button-edit-form" id="edit-form-${index}">
                    <input type="text" class="edit-name" value="${btn.text}" placeholder="Button Name">
                    <textarea class="edit-prompt" rows="4" placeholder="Enter prompt text">${btn.prompt}</textarea>
                    <div class="edit-form-buttons">
                        <button class="save-edit" data-index="${index}">Save</button>
                        <button class="cancel-edit">Cancel</button>
                    </div>
                </div>
            `;
            buttonList.appendChild(buttonElement);
        });

        // Add all event listeners
        addButtonEventListeners();
    });
}

function addButtonEventListeners() {
    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            document.getElementById(`edit-form-${index}`).style.display = 'block';
        });
    });

    // Reset button listeners
    document.querySelectorAll('.reset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset this button to its default settings?')) {
                resetDefaultButton(parseInt(this.dataset.index));
            }
        });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this button?')) {
                deleteButton(parseInt(this.dataset.index));
            }
        });
    });

    // Save edit listeners
    document.querySelectorAll('.save-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            saveEdit(parseInt(this.dataset.index));
        });
    });

    // Cancel edit listeners
    document.querySelectorAll('.cancel-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const form = this.closest('.button-edit-form');
            form.style.display = 'none';
        });
    });
}

function resetDefaultButton(index) {
    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        const button = buttons[index];
        
        if (button.isDefault) {
            buttons[index] = {
                ...button,
                text: button.defaultText,
                prompt: button.defaultPrompt
            };

            chrome.storage.sync.set({ customButtons: buttons }, function() {
                loadButtons();
            });
        }
    });
}

function saveEdit(index) {
    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        const form = document.getElementById(`edit-form-${index}`);
        const newName = form.querySelector('.edit-name').value.trim();
        const newPrompt = form.querySelector('.edit-prompt').value.trim();

        if (!newName || !newPrompt) {
            alert('Please fill in both fields');
            return;
        }

        buttons[index] = {
            ...buttons[index],
            text: newName,
            prompt: newPrompt
        };

        chrome.storage.sync.set({ customButtons: buttons }, function() {
            loadButtons();
        });
    });
}

function addNewButton() {
    const buttonName = document.getElementById('buttonName').value.trim();
    const promptText = document.getElementById('promptText').value.trim();
    
    if (!buttonName || !promptText) {
        alert('Please fill in both fields');
        return;
    }

    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        buttons.push({
            id: 'custom-' + Date.now(),
            text: buttonName,
            prompt: promptText,
            isDefault: false
        });
        
        chrome.storage.sync.set({ customButtons: buttons }, function() {
            document.getElementById('buttonName').value = '';
            document.getElementById('promptText').value = '';
            loadButtons();
        });
    });
}

function deleteButton(index) {
    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        const buttonToDelete = buttons[index];

        let confirmMessage = 'Are you sure you want to delete this button?';
        if (buttonToDelete.isDefault) {
            confirmMessage = 'This is a default button. Are you sure you want to delete it? You can add it back later by resetting the extension.';
        }

        if (confirm(confirmMessage)) {
            buttons.splice(index, 1);
            chrome.storage.sync.set({ customButtons: buttons }, function() {
                loadButtons();
            });
        }
    });
}

// Add a function to restore default buttons
function restoreDefaultButton(defaultButton) {
    chrome.storage.sync.get(['customButtons'], function(result) {
        const buttons = result.customButtons || [];
        buttons.push({
            ...defaultButton,
            isDefault: true,
            defaultText: defaultButton.text,
            defaultPrompt: defaultButton.prompt
        });
        
        chrome.storage.sync.set({ customButtons: buttons }, function() {
            loadButtons();
        });
    });
}

// Add a new button in the dashboard to restore defaults
function addRestoreDefaultsSection() {
    const dashboardContainer = document.querySelector('body');
    const restoreSection = document.createElement('div');
    restoreSection.className = 'restore-defaults-section';
    restoreSection.innerHTML = `
        <div class="section-divider"></div>
        <h3>Restore Default Buttons</h3>
        <div class="default-buttons-list">
            ${DEFAULT_BUTTONS.map(btn => `
                <button class="restore-default-btn" data-id="${btn.id}">
                    Restore ${btn.text} Button
                </button>
            `).join('')}
        </div>
    `;
    
    // Insert before the last section divider
    const lastDivider = document.querySelector('.section-divider:last-of-type');
    dashboardContainer.insertBefore(restoreSection, lastDivider);

    // Add event listeners for restore buttons
    document.querySelectorAll('.restore-default-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const defaultButton = DEFAULT_BUTTONS.find(defBtn => defBtn.id === this.dataset.id);
            if (defaultButton) {
                restoreDefaultButton(defaultButton);
            }
        });
    });
} 