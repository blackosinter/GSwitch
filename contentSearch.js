// Get the page background color
const pageColor = window.getComputedStyle(document.querySelector('body')).backgroundColor;

let languages = [];
let countries = [];

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

// Call the data loading function
async function initialize() {
  // Wait for the data to load
  await loadData();
  main();
}

initialize();

function main() {

  window.addEventListener("resize", getCoordinates);

  const languageButton = document.createElement("button");
  languageButton.style.display = "flex";
  languageButton.type = "button";
  languageButton.style.flex = "0 1 auto";
  languageButton.style.alignItems = "center";
  languageButton.style.justifyContent = "center";
  languageButton.style.border = "none";
  languageButton.style.padding = "0px 8px";
  languageButton.style.borderRadius = "5px";
  languageButton.style.cursor = "pointer";
  languageButton.style.width = "35px";
  languageButton.style.background = "transparent";
  languageButton.style.lineHeight = "44px";
  languageButton.classList.add("language-switch-button");

  const icon = document.createElement("img");
  icon.src = "https://i.ibb.co/N1spbt2/language-121815.png"; // URL of your icon
  icon.alt = "Switch Language";
  icon.style.width = "20px";
  icon.style.height = "20px";
  languageButton.appendChild(icon);

  const searchButton = document.querySelector(".SDkEP");
  if (searchButton) {
    searchButton.appendChild(languageButton); // Insert the button after "Search"
  }

  const container = document.createElement("div");
  container.style.position = "fixed";  // Position it at the top
  container.style.zIndex = "1000";
  container.style.padding = "3px";
  container.style.borderRadius = "15px";
  container.style.boxShadow = "0px 1px 1px #0d0d0d";
  container.style.fontFamily = "Roboto";
  container.style.fontSize = "10px";
  container.style.width = "280px"; // Increase container width for horizontal layout
  container.style.height = "50px";
  container.style.display = "none";
  container.style.backgroundColor = pageColor;
  container.style.direction = "ltr";

  function getCoordinates() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const div = document.querySelector('.language-switch-button');
    const rect = div.getBoundingClientRect();
    container.style.left = `${rect.left - 145}px`
    container.style.top = `${rect.bottom + 15}px`
    console.log(rect.right);
    console.log(container.style.left);
  }

  getCoordinates()

  // Function to create a search input with autocomplete
  function createSearchInput(options, container, placeholder) {
    const input = document.createElement("input");
    input.style.width = "240%";
    input.style.padding = "4px";
    input.style.borderRadius = "10px";
    input.style.border = "1px groove #575859";
    input.style.fontSize = "12px";
    input.style.marginRight = "15px";  // Space between fields
    input.placeholder = placeholder; // Set placeholder text
    container.appendChild(input);
    input.style.padding = "2px";
    input.style.textAlign = "center";

    const dropdown = document.createElement("div");
    dropdown.style.position = "absolute";
    dropdown.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
    dropdown.style.width = "100%";
    dropdown.style.maxHeight = "200px";
    dropdown.style.overflowY = "auto";
    dropdown.style.top = "100%";
    dropdown.style.display = "none";
    dropdown.style.backgroundColor = pageColor;
    container.appendChild(dropdown);

    const updateDropdown = (filter = "") => {
      dropdown.innerHTML = ""; // Clear the dropdown list
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
          dropdown.style.display = "none"; // Close the dropdown
        });
        dropdown.appendChild(item);
      });
      dropdown.style.display = filteredOptions.length ? "block" : "none"; // Show only if there are items
    };

    // Filter the list when input is focused
    input.addEventListener("focus", () => {
      input.value = ""; // Clear input value
      updateDropdown(); // Show all items
    });
    
    // Filter the list while typing
    input.addEventListener("input", () => {
      updateDropdown(input.value); // Filter the list
    });

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  // Create container for input fields and button
  const fieldsContainer = document.createElement("div");
  fieldsContainer.style.display = "flex";  // Arrange elements in a row
  fieldsContainer.style.justifyContent = "space-between";  // Space between fields
  fieldsContainer.style.alignItems = "center";  // Align vertically
  fieldsContainer.style.gap = "72px"; // Set space between fields

  // Create input fields for language and country search
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
  applyButton.style.marginTop = "0px"; // Space between fields and button
  applyButton.style.alignSelf = "center"; // Vertically center the button
  applyButton.style.marginLeft = "72px";
  applyButton.style.boxShadow = "0px 3px 5px rgba(0, 0, 0, 0.1)";

  function hideContainerIfClickedOutside(event) {
    // Check if click is outside the container
    if (!container.contains(event.target) && event.target !== languageButton) {
      container.style.display = "none"; // Hide the container
    }
  }

  // Add event listener for document clicks
  document.addEventListener("click", hideContainerIfClickedOutside);

  function setInitialValues() {
    const currentUrl = new URL(window.location.href);
    const hlValue = currentUrl.searchParams.get("hl");
    if (hlValue) {
      console.log("Language exists");
      const [languageCode, countryCode] = hlValue.split("-");
      const language = languages.find(lang => lang.code === languageCode);
      const country = countries.find(cnt => cnt.code === countryCode);

      if (language) {
        languageContainer.querySelector("input").value = language.name;
      }

      if (country) {
        countryContainer.querySelector("input").value = country.name;
      }
    }
  }

  // Set initial values when the page loads

  // Add event listener for button click
  applyButton.addEventListener("click", () => {
    const selectedLanguage = languageContainer.querySelector("input").value;
    const selectedCountry = countryContainer.querySelector("input").value;

    // Check if the selected values match
    const language = languages.find(lang => lang.name.toLowerCase() === selectedLanguage.toLowerCase());
    const country = countries.find(cnt => cnt.name.toLowerCase() === selectedCountry.toLowerCase());

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
      currentUrl.searchParams.set("hl", hlValue);

      window.location.href = currentUrl.toString();
    }
  });

  languageButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Stop event bubbling to avoid triggering document click
    if (container.style.display == "none") {  
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  });

  // Create a container for input fields and button to align them side by side
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