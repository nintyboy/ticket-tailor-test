document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM loaded with JavaScript");
  /**
   * Setup selectors and state for dropdown
   */
  const dropdownMenuToggle = document.querySelector(
    ".dropdown__box--menu-toggle"
  );
  const clearSelectedItems = document.querySelector(
    ".dropdown__box--menu-clear"
  );
  const dropdownMenu = document.querySelector(".dropdown__menu");
  const selectedItemsContainer = document.querySelector(".dropdown__selected");
  const searchInput = document.querySelector(".dropdown__menu--search-input");
  const noResults = document.querySelector(".no-results");
  const submitButton = document.querySelector(".dropdown__box--submit_btn");
  const errorMessage = document.querySelector(".error_msg");
  const resultsContainer = document.querySelector(".event-list");

  // Grab JSON
  const events = fetch("../data/complex.json").then((response) => {
    if (!response.ok) {
      console.log("Error fetching data");
      //TODO: Handle error
    }
    return response.json();
  });

  // Populate dropdown menu with events

  const eventsData = await events;

  eventsData.forEach((event) => {
    const eventItem = document.createElement("div");
    eventItem.classList.add("dropdown__menu--item");
    eventItem.dataset.value = event.id;
    const dateString = new Date(event.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    eventItem.innerHTML = `
      <i class="fa-solid fa-check hidden"></i>
      <div class="dropdown__menu--item--content">
        <div class="dropdown__menu--item--name">
        <span>${event.name}</span></div>
        <div class="dropdown__menu--item--subtext">${event.time} &#8226; ${dateString}</div>
      </div>
    `;
    dropdownMenu.appendChild(eventItem);
  });

  const dropdownMenuItems = document.querySelectorAll(".dropdown__menu--item");

  let selectedItemsState = new Set();
  const maxVisibleItems = 1; //TODO: 2 if mobile 3/4 if desktop

  function onSelectedItemsStateChange() {
    console.log("Selected items state changed:", selectedItemsState);

    // Clear the selected items container and re-render the items with amount of selected items
    selectedItemsContainer.innerHTML = "";

    const itemsToShow = Array.from(selectedItemsState).slice(
      0,
      maxVisibleItems
    );

    itemsToShow.forEach((itemValue) => {
      const selectedItem = document.createElement("span");
      selectedItem.classList.add("dropdown__selected--event");
      const cellData = eventsData.find(
        (event) => event.id.toString() === itemValue
      );
      console.log("cellData", cellData);
      selectedItem.dataset.value = cellData.id;

      selectedItem.innerHTML = `
        ${cellData.name}
        <span class="remove-event">
          <i class="fa-solid fa-xmark"></i>
        </span>
        `;
      selectedItemsContainer.appendChild(selectedItem);
    });

    // Add special element if selected items exceed a certain count

    if (selectedItemsState.size > maxVisibleItems) {
      const extraCount = selectedItemsState.size - maxVisibleItems;

      const extraItem = document.createElement("span");
      extraItem.classList.add("dropdown__selected--event");
      extraItem.innerHTML = `+${extraCount}`;
      selectedItemsContainer.appendChild(extraItem);
    }
    // Keep the dropdown menu items in sync with the selected items
    dropdownMenuItems.forEach((add) => {
      if (selectedItemsState.has(add.dataset.value)) {
        // console.log("Adding active class", add.querySelector("i"));
        add.querySelector("i").classList.remove("hidden");
        add.classList.add("active");
      } else {
        add.querySelector("i").classList.add("hidden");
        add.classList.remove("active");
      }
    });

    //If selected items is more than 0 show a quick clear
    if (selectedItemsState.size > 0) {
      clearSelectedItems.classList.remove("hidden");
    } else {
      clearSelectedItems.classList.add("hidden");
    }
  }

  // Clear all Selected Items
  clearSelectedItems.addEventListener("click", () => {
    selectedItemsState.clear();
  });

  // Simple state management by overriding the add and delete
  const originalAdd = selectedItemsState.add.bind(selectedItemsState);
  const originalDelete = selectedItemsState.delete.bind(selectedItemsState);
  const originalClear = selectedItemsState.clear.bind(selectedItemsState);

  selectedItemsState.add = function (value) {
    const result = originalAdd(value);
    onSelectedItemsStateChange();
    return result;
  };

  selectedItemsState.delete = function (value) {
    console.log("Deleting", value);
    const result = originalDelete(value);
    onSelectedItemsStateChange();
    return result;
  };

  selectedItemsState.clear = function () {
    const result = originalClear();
    onSelectedItemsStateChange();
    return result;
  };

  // Event listeners

  // Toggle dropdown menu
  dropdownMenuToggle.addEventListener("click", (event) => {
    dropdownMenu.classList.toggle("hidden");
    event.stopPropagation();
  });

  // Close dropdown menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !dropdownMenu.contains(event.target) &&
      !dropdownMenuToggle.contains(event.target)
    ) {
      dropdownMenu.classList.add("hidden");
    }
  });

  // Remove Selected Items
  selectedItemsContainer.addEventListener("click", (event) => {
    if (event.target.closest(".remove-event")) {
      const itemValue = event.target.closest(".dropdown__selected--event")
        .dataset.value;
      selectedItemsState.delete(itemValue);
    }
    console.log(selectedItemsState);
  });

  // Add Event from dropdown menu
  dropdownMenuItems.forEach((add) => {
    add.addEventListener("click", () => {
      const itemValue = add.dataset.value;
      if (selectedItemsState.has(itemValue)) {
        selectedItemsState.delete(itemValue);
      } else {
        selectedItemsState.add(itemValue);
      }
    });

    // Filter list of events by simple search

    searchInput.addEventListener("input", (event) => {
      const search = event.target.value.toLowerCase();
      const items = Array.from(dropdownMenuItems);
      let hasResults = false;

      items.forEach((item) => {
        if (item.textContent.toLowerCase().includes(search)) {
          item.style.display = "flex";
          hasResults = true;
        } else {
          item.style.display = "none";
        }
      });
      noResults.classList.toggle("hidden", hasResults);
    });
  });

  // Submit selected items
  submitButton.addEventListener("click", () => {
    errorMessage.classList.toggle("hidden", selectedItemsState.size > 0);
    resultsContainer.innerHTML = "";
    if (selectedItemsState.size > 0) {
      console.log("Submitting", selectedItemsState);

      selectedItemsState.forEach((itemValue) => {
        const cellData = eventsData.find(
          (event) => event.id.toString() === itemValue
        );
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-list__item");
        const dateString = new Date(cellData.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

        // eventItem.innerHTML = `
        //   <div class="event-list item__content">
        //     <div class="event-list item__name">${cellData.name}</div>
        //     <div class="event-list item__subtext">${cellData.time} &#8226; ${dateString}</div>
        //   </div>
        //   <i class="fa-solid fa-chevron-right"></i>
        // `;

        eventItem.innerHTML = `id: ${cellData.id},  name: ${cellData.name},  date: ${cellData.date},  time: ${cellData.time}`;
        resultsContainer.appendChild(eventItem);
      });
    }
  });
});
