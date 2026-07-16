// Function responsible for populating structural groups and event schedules
async function loadSiteData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Unable to target data source matrix or fetch data.json.");
        const data = await response.json();

        // Standard abstract helper function targeting list generation logic
        const mapListItems = (elementId, arrayData) => {
            const listRef = document.getElementById(elementId);
            if (listRef && arrayData) {
                listRef.innerHTML = ""; // Flushes initialization placeholders
                arrayData.forEach(item => {
                    let li = document.createElement('li');
                    
                    // Checks if item is an object or plain text
                    if (typeof item === 'object' && item !== null) {
                        li.textContent = item.role ? `${item.name} — ${item.role}` : item.name;
                    } else {
                        li.textContent = item;
                    }
                    
                    listRef.appendChild(li);
                });
            }
        };

        // Render Personnel Arrays
        mapListItems('list-officers', data.officers);
        mapListItems('list-ncos', data.ncos);
        mapListItems('list-anchors', data.anchor_boys);
        mapListItems('list-company', data.company_section);
        mapListItems('list-exco', data.exco);
        mapListItems('list-patrons', data.patrons);

        // Render Dynamic Event Grid Elements
        const eventContainer = document.getElementById('events-container');
        if (eventContainer && data.events) {
            eventContainer.innerHTML = ""; 
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let activeEventsCount = 0;

            data.events.forEach(event => {
                const eventDate = new Date(event.compareDate);

                if (eventDate >= today) {
                    activeEventsCount++;
                    eventContainer.innerHTML += `
                        <div class="event-card">
                            <h4>${event.title}</h4>
                            <div class="event-meta">${event.dateString} | ${event.time}</div>
                            <p>${event.description}</p>
                        </div>
                    `;
                }
            });

            if (activeEventsCount === 0) {
                eventContainer.innerHTML = `
                    <div class="no-events" style="color: #003366; font-style: italic; grid-column: 1/-1; text-align: center; padding: 20px;">
                        No upcoming registered programmes at the moment. Check back soon!
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error("Error loading data from JSON file:", error);
        // Fallback message visually displayed if the JSON fetch is blocked locally
        const eventContainer = document.getElementById('events-container');
        if (eventContainer) {
            eventContainer.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Note: If testing locally from your desktop files directly, make sure to use a live server environment so JavaScript can securely read your data.json file.</p>`;
        }
    }
}

// Global scope toggle action logic mapping for Accordion panels
function toggleSection(id) {
    const targetPanel = document.getElementById(id);
    if (!targetPanel) return;
    
    const isCurrentActive = targetPanel.style.display === "block";
    const currentBtn = targetPanel.previousElementSibling;
    
    // Closes all other open panels for clean single accordion presentation
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = "none";
        const btn = panel.previousElementSibling;
        if (btn && btn.querySelector('span')) {
            btn.querySelector('span').textContent = "+";
        }
    });

    // Toggle target paths and swap symbols smoothly
    if (!isCurrentActive) {
        targetPanel.style.display = "block";
        if (currentBtn && currentBtn.querySelector('span')) currentBtn.querySelector('span').textContent = "−";
    } else {
        targetPanel.style.display = "none";
        if (currentBtn && currentBtn.querySelector('span')) currentBtn.querySelector('span').textContent = "+";
    }
}

// Bind load task execution framework to active runtime listener
window.addEventListener('DOMContentLoaded', loadSiteData);