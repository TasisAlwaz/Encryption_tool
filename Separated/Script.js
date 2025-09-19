document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const inputText = document.getElementById('inputText');
    const password = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    const tagInput = document.getElementById('tagInput');
    const saveBtn = document.getElementById('saveBtn');
    const loadSelect = document.getElementById('loadSelect');
    const deleteBtn = document.getElementById('deleteBtn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    const STORAGE_KEY = 'aesEncryptedData_v2';

    // --- Notification Function ---
    function showNotification(message, duration = 3000) {
        notificationMessage.textContent = `// ${message}`;
        notification.style.transform = 'translateX(0)';
        setTimeout(() => {
            notification.style.transform = 'translateX(calc(100% + 2rem))';
        }, duration);
    }

    // --- Toggle Password Visibility ---
    togglePassword.addEventListener('click', () => {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        eyeIcon.classList.toggle('hidden');
        eyeOffIcon.classList.toggle('hidden');
    });

    // --- Encryption/Decryption Core ---
    encryptBtn.addEventListener('click', () => {
        const plainText = inputText.value;
        const pass = password.value;
        if (!plainText || !pass) {
            showNotification('Error: Text and Secret_Key required.');
            return;
        }
        try {
            const encrypted = CryptoJS.AES.encrypt(plainText, pass).toString();
            outputText.value = encrypted;
            showNotification('Encryption successful.');
        } catch (e) {
            showNotification('Fatal: Encryption failed.');
            console.error(e);
        }
    });

    decryptBtn.addEventListener('click', () => {
        const cipherText = inputText.value;
        const pass = password.value;
        if (!cipherText || !pass) {
            showNotification('Error: Encrypted text and Secret_Key required.');
            return;
        }
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, pass);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (decrypted) {
                outputText.value = decrypted;
                showNotification('Decryption successful.');
            } else {
                showNotification('Decryption failed. Check Secret_Key/Input.');
            }
        } catch (e) {
            showNotification('Fatal: Decryption failed. Invalid input.');
            console.error(e);
        }
    });

    // --- Clipboard ---
    copyBtn.addEventListener('click', () => {
        if (outputText.value) {
            navigator.clipboard.writeText(outputText.value).then(() => {
                showNotification('Output_Log copied to clipboard.');
            }).catch(err => {
                showNotification('Clipboard access denied.');
            });
        }
    });

    // --- Local Storage Management ---
    function getStoredData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    function populateLoadSelect() {
        const data = getStoredData();
        loadSelect.innerHTML = '<option value="">> Select saved data...</option>';
        const sortedTags = Object.keys(data).sort();
        for (const tag of sortedTags) {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            loadSelect.appendChild(option);
        }
    }

    saveBtn.addEventListener('click', () => {
        const tag = tagInput.value.trim();
        const encryptedText = outputText.value;
        if (!tag || !encryptedText) {
            showNotification('Error: Tag and encrypted text required to save.');
            return;
        }
        const data = getStoredData();
        data[tag] = encryptedText;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        tagInput.value = '';
        populateLoadSelect();
        showNotification(`Data saved with tag: "${tag}"`);
    });

    loadSelect.addEventListener('change', () => {
        const tag = loadSelect.value;
        if (tag) {
            const data = getStoredData();
            inputText.value = data[tag] || '';
            outputText.value = ''; 
            password.focus();
            showNotification(`Data loaded for tag: "${tag}"`);
        }
    });
    
    deleteBtn.addEventListener('click', () => {
        const tag = loadSelect.value;
        if (!tag) {
            showNotification('Error: Select a tag to delete.');
            return;
        }
        const data = getStoredData();
        const textToDelete = data[tag];
        delete data[tag];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (inputText.value === textToDelete) {
            inputText.value = '';
            outputText.value = '';
        }
        populateLoadSelect();
        showNotification(`Deleted tag: "${tag}"`);
    });
    
    // Initial population of the dropdown
    populateLoadSelect();
});
