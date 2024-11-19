let languages = [];
let countries = [];
let exotic = ["ar", "he", "fa", "ur"]
let isExotic = null;

// check conditions while loading the page
window.addEventListener("load", () => {
  if (localStorage.getItem("firstReloadDone") === "true") {
    // If first reload is done, remove the flag and reload the page again.
    localStorage.removeItem("firstReloadDone");
    window.location.reload();
  }

    // Second reloading with changing URL
  }
);
// Function to load JSON files
async function loadData() {
  try {
    // Load both JSON files
    const response1 = await fetch(chrome.runtime.getURL('languages.json'));
    languages = await response1.json();

    const response2 = await fetch(chrome.runtime.getURL('countries.json'));
    countries = await response2.json();

  } catch (error) {
    console.error('Error loading JSON files:', error);
  }
}

// Calling the data loading function
async function initialize() {
  // Wait for the data to load
  await loadData();
  main();
}

initialize();

function main() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "2%";  // Positioning at the top
  container.style.zIndex = "1000";
  container.style.padding = "3px";
  container.style.backgroundColor = "white";
  container.style.border = "0px solid #ccc";
  container.style.borderRadius = "6px";
  //container.style.boxShadow = "0px 3px 5px rgba(0, 0, 0, 0.1)";
  container.style.fontFamily = "Roboto";
  container.style.fontSize = "10px";
  container.style.width = "280px"; // Increase the container width for horizontal placement
  container.style.direction = "ltr";


  function getCoordinates(isExotic) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const div = document.querySelector('.VfPpkd-Jh9lGc');
      const rect = div.getBoundingClientRect();
      if (isExotic){
      container.style.left = `${rect.right - rect.width + 280 + 20}px`
      }
      else {
          container.style.left = `${rect.right - rect.width - 280 - 20}px`
      }
  }

  getCoordinates(isExotic)

  window.addEventListener("resize", getCoordinates(isExotic));


  // Function to create a search input with autocomplete
  function createSearchInput(options, container, placeholder) {
    const input = document.createElement("input");
    input.style.width = "240%";
    input.style.padding = "4px";
    input.style.borderRadius = "10px";
    input.style.border = "1px groove #97999c";
    input.style.fontSize = "12px";
    input.style.marginRight = "15px";  // Space between fields
    input.placeholder = placeholder; // Set placeholder
    container.appendChild(input);
    input.style.padding = "2px";
    input.style.textAlign = "center";
    input.style.boxShadow = "0px 3px 5px rgba(0, 0, 0, 0.1)";

    const dropdown = document.createElement("div");
    dropdown.style.position = "absolute";
    dropdown.style.backgroundColor = "white";
    dropdown.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
    dropdown.style.width = "100%";
    dropdown.style.maxHeight = "200px";
    dropdown.style.overflowY = "auto";
    dropdown.style.top = "100%";
    dropdown.style.display = "none";
    container.appendChild(dropdown);

    const updateDropdown = (filter = "") => {
      dropdown.innerHTML = ""; // Clear the list
      const filteredOptions = options.filter(option => 
        option.name.toLowerCase().includes(filter.toLowerCase())
      );
      filteredOptions.forEach(option => {
        const item = document.createElement("div");
        item.style.padding = "6px";
        item.style.cursor = "pointer";
        item.textContent = option.name;
        item.addEventListener("click", () => {
          input.value = option.name;
          dropdown.style.display = "none"; // Close the list
        });
        dropdown.appendChild(item);
      });
      dropdown.style.display = filteredOptions.length ? "block" : "none"; // Show only if there are items
    };

    // Filtering the list
    input.addEventListener("focus", () => {
      input.value = ""; // Clear the value
      updateDropdown(); // Show all items
    });
    
    // Close the list if the input loses focus (optional)
    input.addEventListener("input", () => {
      updateDropdown(input.value); // Filter the list
    });

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  // Create a container for the input fields and button
  const fieldsContainer = document.createElement("div");
  fieldsContainer.style.display = "flex";  // Align items in one row
  fieldsContainer.style.justifyContent = "space-between";  // Space between fields
  fieldsContainer.style.alignItems = "center";  // Align vertically
  fieldsContainer.style.gap = "72px"; // Set the gap between fields

  // Create search fields for language and country
  const languageContainer = document.createElement("div");
  createSearchInput(languages, languageContainer, "Language");
  fieldsContainer.appendChild(languageContainer);

  const countryContainer = document.createElement("div");
  createSearchInput(countries, countryContainer, "Country");
  fieldsContainer.appendChild(countryContainer);

  // Create the apply button
  const applyButton = document.createElement("button");
  applyButton.textContent = "Apply";
  applyButton.style.padding = "6px";
  applyButton.style.background = "linear-gradient(to right, #00c6ff, #0072ff)";
  applyButton.style.color = "white";
  applyButton.style.border = "none";
  applyButton.style.borderRadius = "5px";
  applyButton.style.cursor = "pointer";
  applyButton.style.marginTop = "0px"; // Adds space between fields and the button
  applyButton.style.alignSelf = "center"; // Align the button vertically with fields
  applyButton.style.marginLeft = "72px";

  applyButton.style.boxShadow = "0px 3px 5px rgba(0, 0, 0, 0.1)";


// Set initial values when the page loads
  function setInitialValues() {
    const currentUrl = new URL(window.location.href);
    const hlValue = currentUrl.searchParams.get("hl");
    if (hlValue) {
      const [languageCode, countryCode] = hlValue.split("-");
      const language = languages.find(lang => lang.code === languageCode);
      const country = countries.find(cnt => cnt.code === countryCode);
      if (exotic.includes(language.code)) {
        isExotic = 1;
        getCoordinates(isExotic);
      }
      if (language) {
        languageContainer.querySelector("input").value = language.name;
      }

      if (country) {
        countryContainer.querySelector("input").value = country.name;
      }
    }
  }

  // Add event listener for apply button
  applyButton.addEventListener("click", () => {
    console.log("ты нажал на кнопку!");
    const selectedLanguage = languageContainer.querySelector("input").value;
    const selectedCountry = countryContainer.querySelector("input").value;

    // Check if the selected values match
    const language = languages.find(lang => lang.name.toLowerCase() === selectedLanguage.toLowerCase());
    const country = countries.find(cnt => cnt.name.toLowerCase() === selectedCountry.toLowerCase());
    
    if (exotic.includes(language.code)) {
      console.log("не экзотичная хуйня");
      isExotic = 1;
      getCoordinates(isExotic);
    }

    if (language) {
      let hlValue;
      let currentUrl;
      if (country){
        hlValue = `${language.code}-${country.code}`;
        currentUrl = new URL(window.location.href);
      }
      else {
        hlValue = `${language.code}`;
        currentUrl = new URL(window.location.href);
      }
      // Set the new hl parameter
      localStorage.setItem("firstReloadDone", "true");
      currentUrl.searchParams.set("hl", hlValue);

      window.location.href = currentUrl.toString();
    }
 });

  // Create a container for input fields and the button to be aligned horizontally
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";
  buttonContainer.style.alignItems = "center";
  buttonContainer.appendChild(fieldsContainer);
  buttonContainer.appendChild(applyButton);

  // Add elements to the page
  container.appendChild(buttonContainer);
  document.body.appendChild(container);

  setInitialValues();

}