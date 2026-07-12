// Function responsible for populating structural groups and event schedules
async function loadSiteData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Unable to target data source matrix.");
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
            
            // Get today's date at midnight for an accurate comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let activeEventsCount = 0;

            data.events.forEach(event => {
                // Parse the comparison date from the JSON
                const eventDate = new Date(event.compareDate);

                // ONLY show the event if it's today or in the future
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

            // Fallback message if all listed events have passed
            if (activeEventsCount === 0) {
                eventContainer.innerHTML = `
                    <div class="no-events" style="color: #003366; font-style: italic; grid-column: 1/-1; text-align: center; padding: 20px;">
                        No upcoming registered programmes at the moment. Check back soon!
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error("Error loading data:", error);
    }
} /* <--- THIS BRACE WAS MISSING AND BREAKING EVERYTHING */

// Global scope toggle action logic mapping
function toggleSection(id) {
    const targetPanel = document.getElementById(id);
    if (!targetPanel) return;
    
    const isCurrentActive = targetPanel.style.display === "block";
    
    // Closes all other open panels for clean single accordion presentation
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = "none";
    });

    // Toggle logic path
    targetPanel.style.display = isCurrentActive ? "none" : "block";
}

// Bind load task execution framework to active runtime listener
window.onload = loadSiteData;