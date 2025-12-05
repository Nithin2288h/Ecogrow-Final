// ========== Firebase Order System ==========

// Your Firebase Realtime Database URL
const firebaseURL = "https://orders-840d7-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json";

// DOM elements
const form = document.getElementById("orderForm");
const successMsg = document.getElementById("successMsg");
const profileGrid = document.getElementById("profileGrid");
const rawDataDisplay = document.getElementById("rawData");
const farmerTab = document.getElementById("farmerTab");
const fpoTab = document.getElementById("fpoTab");

let allData = [];
let selectedTab = "Farmer";

// ========== FETCH DATA ==========
async function fetchData() {
  try {
    profileGrid.innerHTML = "<p>Loading data...</p>";
    const response = await fetch(firebaseURL);
    const data = await response.json();

    if (!data) {
      profileGrid.innerHTML = "<p>No data found yet.</p>";
      rawDataDisplay.textContent = "(no data yet)";
      return;
    }

    // Convert Firebase object into array
    allData = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));

    // Display JSON data for debugging
    rawDataDisplay.textContent = JSON.stringify(allData, null, 2);

    // Show only selected tab’s data
    renderProfiles();
  } catch (error) {
    console.error("Error fetching data:", error);
    profileGrid.innerHTML = "<p style='color:red;'>Error fetching data.</p>";
  }
}

// ========== RENDER PROFILES ==========
function renderProfiles() {
  const filtered = allData.filter((item) => item.typeOfUser === selectedTab);

  if (filtered.length === 0) {
    profileGrid.innerHTML = `<p>No ${selectedTab} orders yet.</p>`;
    return;
  }

  profileGrid.innerHTML = filtered
    .map(
      (item) => `
      <div class="profile-card3">
        <div class="profile-image3">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="User" />
        </div>
        <div class="profile-details3">
          <p><strong>Name:</strong> ${item.name || "N/A"}</p>
          <p><strong>Phone:</strong> ${item.phoneNumber || "N/A"}</p>
          <p><strong>Location:</strong> ${item.location || "N/A"}</p>
          <p><strong>Service:</strong> ${item.selectedService || "N/A"}</p>
          <p><strong>Message:</strong> ${item.message || "N/A"}</p>
        </div>
        ${
          item.phoneNumber
            ? `<button class="whatsapp-button3" onclick="window.open('https://wa.me/${item.phoneNumber}', '_blank')">Chat on WhatsApp</button>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

// ========== SUBMIT NEW ORDER ==========
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newOrder = {
    typeOfUser: document.getElementById("typeOfUser").value,
    name: document.getElementById("name").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    location: document.getElementById("location").value,
    selectedService: document.getElementById("selectedService").value,
    message: document.getElementById("message").value,
  };

  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    if (response.ok) {
      // Firebase returns an object like { name: "-Mx..." }
      let resJson = null;
      try { resJson = await response.json(); } catch (e) { /* ignore */ }
      successMsg.textContent = "✅ Order submitted successfully!";
      form.reset();

      // If we got the new key from Firebase, add the item locally for instant display
      if (resJson && resJson.name) {
        const newItem = { id: resJson.name, ...newOrder };
        allData.unshift(newItem); // show newest first
        renderProfiles();
      } else {
        // fallback: re-fetch full list
        await fetchData();
      }

      // Hide message after 3 seconds
      setTimeout(() => (successMsg.textContent = ""), 3000);
    } else {
      successMsg.textContent = "❌ Failed to submit order.";
    }
  } catch (error) {
    console.error("Error submitting order:", error);
    successMsg.textContent = "❌ Error submitting order.";
  }
});

// ========== TAB SWITCHING ==========
farmerTab.addEventListener("click", () => {
  selectedTab = "Farmer";
  farmerTab.classList.add("active3");
  fpoTab.classList.remove("active3");
  renderProfiles();
});

fpoTab.addEventListener("click", () => {
  selectedTab = "FPO";
  fpoTab.classList.add("active3");
  farmerTab.classList.remove("active3");
  renderProfiles();
});

// ========== INITIAL LOAD ==========
fetchData();

// Refresh button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fetchData();
  });
}

// Debug panel toggle: keep rawData element for functionality but hide it by default in the UI
try {
  const toggleBtn = document.getElementById('toggleRawBtn');
  const debugPanel = document.getElementById('debugPanel');
  if (toggleBtn && debugPanel) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = debugPanel.style.display === 'none' || debugPanel.style.display === '';
      debugPanel.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide debug' : 'Show debug';
    });
  }
} catch (err) {
  console.warn('Could not initialize debug toggle', err);
}
