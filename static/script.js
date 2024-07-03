var upload_modal = document.getElementById("uploadModal");
var upload_btn = document.getElementById("uploadBtn");
var upload_span = document.getElementsByClassName("close")[0];
upload_btn.onclick = function() {
    upload_modal.style.display = "block";
}
upload_span.onclick = function() {
    upload_modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == upload_modal) {
        upload_modal.style.display = "none";
    }
}

var createFolder_modal = document.getElementById("createFolderModal");
var createFolder_btn = document.getElementById("createFolderBtn");
var createFolder_span = document.getElementsByClassName("close")[1];
createFolder_btn.onclick = function() {
    createFolder_modal.style.display = "block";
}
createFolder_span.onclick = function() {
    createFolder_modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == createFolder_modal) {
        createFolder_modal.style.display = "none";
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const files = document.getElementById('file').files;
    const password = document.getElementById('upload_password').value;
    const currentPath = document.getElementById('upload_currentPath').value;
    const progressBarContainer = document.getElementById('progressBar');
    let upload_size = 0;
    for(i=0; i<files.length; i++){
        upload_size += files[i].size;
    }
    console.log(upload_size);
    if (files.length === 0) {
        alert('No files selected!');
        return;
    }
    progressBarContainer.innerHTML = '';
    let results = [];

    fetch('/available_space', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderPath: currentPath })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.free_space < upload_size) {
            alert('Total files size '+ Number(upload_size/1000000).toFixed(2) +'Mb exceeds available space "'+ Number(data.free_space/1000000).toFixed(2) +'Mb". Cannot upload files!!');
            window.location.reload();
        }
        else{
            for (let i = 0; i < files.length; i++) {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('password', password);
                formData.append('currentPath', currentPath);
                formData.append('files', files[i]);
                formData.append('file_size', files[i].size);
    
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.id = 'progress_bar_' + i;
    
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-bar-fill';
                progressFill.id = 'progress_fill_' + i;
                progressFill.textContent = '0%';
    
                const uploading_file_name = document.createElement('p');
                uploading_file_name.id = files[i].name;
                uploading_file_name.textContent = files[i].name;
    
                progressBar.appendChild(progressFill);
                progressBarContainer.appendChild(uploading_file_name);
                progressBarContainer.appendChild(progressBar);
    
                xhr.open('POST', this.action, true);
    
                xhr.upload.onprogress = function(event) {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        progressFill.style.width = percentComplete + '%';
                        progressFill.textContent = Math.round(percentComplete) + '%';
                    }
                };
    
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        results.unshift(files[i].name + " uploaded successfully");
                    } else if (xhr.status ===500 || xhr.status === 507) {
                        results.push(files[i].name + "upload failed: Insufficient Disk Space");
                    } else {
                        results.push(files[i].name + " upload failed: " + xhr.statusText);
                    }
    
                    if (results.length === files.length) {
                        alert(results.join("\n"));
                        window.location.reload();
                    }
                };
    
                xhr.onerror = function() {
                    results.push(files[i].name + " upload failed: Network error");
    
                    if (results.length === files.length) {
                        alert(results.join("\n"));
                        window.location.reload();
                    }
                };
    
                xhr.send(formData);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to upload file/s');
    });
});

function hasReservedChars(reservedChars, folderName) {
    for (let i = 0; i < folderName.length; i++) {
        if (reservedChars.includes(folderName[i])) {
            return true;
        }
    }
    return false;
}
function hasReservedNames(reservedNames, folderName) {
    for (let i=0; i<reservedNames.length; i++){
        if (folderName.includes(reservedNames[i])){
            return true;
        }
    }
    return false;
}
document.getElementById('createFolderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const reservedChars = '<>:."\\|?*\x00-\x1F';
    const reservedNames = [
        "CON", "PRN", "AUX", "NUL", 
        "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
    ];
    const folderName = document.getElementById('folderName').value;
    const password = document.getElementById('createfolder_password').value;
    const currentPath = document.getElementById('createfolder_currentPath').value;

    if (hasReservedChars(reservedChars, folderName) || hasReservedNames(reservedNames, folderName)) {
        alert("Folder containes reserved characters or names!!");
    }else{
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('password', password);
        formData.append('currentPath', currentPath);
        formData.append('folder', folderName);
        xhr.open('POST', this.action, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                window.location.reload();
            } else if (xhr.readyState === 4) {
                alert("Falied to create folder!!");
                window.location.reload();
            }
        };
        xhr.send(formData);
    }
});

document.getElementById("search").addEventListener('click', function(){
    var userInput = document.getElementById("search_name").value.toLowerCase();
    const gridContainer = document.getElementById('grid-container');
    const fileitemsArray = Array.from(gridContainer.getElementsByClassName('grid-item-file'));
    const folderitemsArray = Array.from(gridContainer.getElementsByClassName('grid-item-folder'));
    var display_items = [];
    fileitemsArray.forEach((item) => {
        if(item.querySelector('p').textContent.trim().toLowerCase().includes(userInput)){
            display_items.push(item);
        }
    });
    folderitemsArray.forEach((item) => {
        if(item.querySelector('p').textContent.trim().toLowerCase().includes(userInput)){
            display_items.push(item);
        }
    });

    while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    display_items.forEach(item => gridContainer.appendChild(item));
});

document.getElementById('sortDropdown').addEventListener('change', function() {
    sortGridItems(this.value);
});

function sortGridItems(order) {
    const gridContainer = document.getElementById('grid-container');
    const fileitemsArray = Array.from(gridContainer.getElementsByClassName('grid-item-file'));
    const folderitemsArray = Array.from(gridContainer.getElementsByClassName('grid-item-folder'));
    
    fileitemsArray.sort((a, b) => {
        const nameA = a.querySelector('p').textContent.trim().toLowerCase();
        const nameB = b.querySelector('p').textContent.trim().toLowerCase();
        if (order === 'desc') {
            return nameB.localeCompare(nameA);
        } else {
            return nameA.localeCompare(nameB);
        }
    });
    folderitemsArray.sort((a, b) => {
        const nameA = a.querySelector('p').textContent.trim().toLowerCase();
        const nameB = b.querySelector('p').textContent.trim().toLowerCase();
        if (order === 'desc') {
            return nameB.localeCompare(nameA);
        } else {
            return nameA.localeCompare(nameB);
        }
    });
    if(order=='asc'){
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        folderitemsArray.forEach(item => gridContainer.appendChild(item));
        fileitemsArray.forEach(item => gridContainer.appendChild(item));

    }
    else{
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }
        folderitemsArray.forEach(item => gridContainer.appendChild(item));
        fileitemsArray.forEach(item => gridContainer.appendChild(item));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var sessionCode = sessionStorage.getItem('session_code');
    var deleteButtons = document.querySelectorAll('.delete');
    var code = document.getElementById('secret_code').innerText;
    if (sessionCode==code) {
        deleteButtons.forEach(function(button) {
        button.style.display = 'inline-block';
        });
    } else {
        deleteButtons.forEach(function(button) {
        button.style.display = 'none';
        });
    }

    const gridItems = document.querySelectorAll('.grid-item-folder');
    const contextMenu = document.getElementById('context-menu');
    gridItems.forEach(item => {
        if(sessionCode==code){
            contextMenu.querySelector('.context-menu-item-delete').style.display = 'block';
        }
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();

            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const { clientX: mouseX, clientY: mouseY } = e;

            contextMenu.style.top = `${mouseY + scrollTop}px`;
            contextMenu.style.left = `${mouseX + scrollLeft}px`;
            contextMenu.style.display = 'block';

            const folderName = item.querySelector(".single-line").innerText;
            contextMenu.dataset.folderName = folderName;
            const folderPath = item.querySelector('.image-container').href;
            const localFolderPath = new URL(folderPath).pathname;
            contextMenu.dataset.folderPath = decodeURIComponent(localFolderPath);
        });
    });

    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });

    contextMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

function deleteItem() {
    const contextMenu = document.getElementById('context-menu');
    const folderName = contextMenu.dataset.folderName;
    const folderPath = contextMenu.dataset.folderPath;

    if (confirm(`Delete ${folderName}?`)) {
        fetch('/delete_folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folderPath: folderPath })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Folder deleted successfully');
                window.location.reload();
            } else {
                alert('Failed to delete folder');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete folder');
        });
    }
}

function downloadItem() {
    const contextMenu = document.getElementById('context-menu');
    const folderName = contextMenu.dataset.folderName;
    const folderPath = contextMenu.dataset.folderPath;
    fetch('/download_folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderPath: folderPath, folderName: folderName })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = folderName + '.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to download folder as zip');
    });
}

document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        const deleteLink = this.querySelector('a.delete-link');
        let originalHref = deleteLink.href;
        originalHref = originalHref.replaceAll("%255C", "/");
        let filename = originalHref.split('/').pop();
        filename = filename.replaceAll("%2520", " ");

        if (confirm(`${filename} is going to be deleted`)) {
            deleteLink.href = originalHref;
            window.location.href = originalHref;
        } else {
            deleteLink.href = '#';
            setTimeout(() => {
                deleteLink.href = originalHref;
            }, 100);
        }
    });
});

function checkSessionCode() {
    let sessionCode = sessionStorage.getItem('session_code');
    let sessionCodeExpiry = sessionStorage.getItem('session_code_expiry');

    if (sessionCode && sessionCodeExpiry) {
        let currentTime = Date.now();
        if (currentTime > sessionCodeExpiry) {
            sessionStorage.removeItem('session_code');
            sessionStorage.removeItem('session_code_expiry');
            //alert('Session has expired. Please log in again.');
        }
    }
}