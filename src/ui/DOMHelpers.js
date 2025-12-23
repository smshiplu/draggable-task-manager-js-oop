
export class DOMHelpers {

  static getElementById(id) {
    const element = document.getElementById(id);

    if(!element) {
      throw new Error(`Element cannot be found by the ID ${id}!`)
    }
    return element;
  }

  static querySelectorAll(selector) {
    const elements = document.querySelectorAll(selector); 

    if(!elements.length) {
      throw new Error(`Elements cannot be found by the selector ${selector}!`)
    }

    return elements;
  }

  static createCard(task, tooltipOptions) {

    const card = document.createElement("div");
    card.className = "card bg-yellow-50 dark:bg-gray-700 dark:border-gray-600 p-2 my-2 h-32 shadow-2xl rounded flex flex-col justify-between";
    card.draggable = true;
    card.dataset.title = task.title;

    const titleDiv = document.createElement("div");
    const title = document.createElement("p");
    title.className = "task-title font-semibold text-sm mb-2 max-h-14 overflow-hidden text-ellipsis line-clamp-2";
    title.textContent = task.title;
    
    const dateTime =  document.createElement("time");
    dateTime.className = "date-time text-xs text-gray-400 italic flex items-center justify-center";
    dateTime.dateTime = task.timestamp;
    dateTime.textContent = task.timestamp;

    titleDiv.appendChild(title);
    titleDiv.appendChild(dateTime);

    const actionDiv = document.createElement("time");
    actionDiv.className = "actions text-center flex justify-center items-center gap-2 relative z-10";


    // Tooltip
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip hidden absolute bottom-8 -right-8 z-20  p-1 text-sm font-medium text-gray-900 bg-gray-600 dark:bg-white border border-gray-200 rounded-lg shadow-xs opacity-100 w-20";

    const tooltipBtnDiv = document.createElement("div");
    tooltipBtnDiv.className = "flex flex-col gap-1 relative before:content-['▼'] before:absolute before:-bottom-4 before:left-1/2 before:-translate-x-1/2  before:text-gray-600 dark:before:text-white";


    tooltipOptions.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option.name;
      btn.className = "tooltip-btn border-2 border-gray-700 rounded p-px text-[8px] cursor-pointer bg-gray-300 transition-all hover:scale-105";
      btn.dataset.move = option.moveTo;
      tooltipBtnDiv.appendChild(btn);
    });


    tooltipDiv.appendChild(tooltipBtnDiv);
    // actionDiv.appendChild(tooltipDiv);


    const buttons = [
      {name: "Delete", text:"🗑", status: task.status, title: task.title, className: "deleteBtn w-6 h-6 bg-pink-600 text-xs rounded cursor-pointer transition-all duration-100 ease-in-out hover:scale-110"},
      {name: "Edit", text:"🖍", status: task.status, title: task.title, className: "editBtn w-6 h-6 bg-blue-600 text-xs rounded cursor-pointer transition-all duration-100 ease-in-out hover:scale-110"},
      {name: "Move", text:"✈", status: task.status, title: task.title, className: "moveBtn w-6 h-6 bg-purple-600 text-xs rounded cursor-pointer transition-all duration-100 ease-in-out hover:scale-110 relative flex items-center justify-center"},
    ]


    //create button and append to action div
    buttons.forEach((item) => {
      const btn = document.createElement("button"); 

      btn.textContent = item.text;
      btn.className = item.className;
      btn.dataset.status =  item.status;
      btn.dataset.title =  item.title;
      btn.title = item.name;
      if(btn.title === "Move") {
        btn.appendChild(tooltipDiv)
      }
      actionDiv.appendChild(btn);
    });

    card.appendChild(titleDiv);
    card.appendChild(actionDiv);

    // parent.appendChild(card);
    return card;
  }

  static appendFragment(parent, tasks, createCardFn) {
    const fragment = document.createDocumentFragment();

    tasks.forEach(task => {
      fragment.appendChild(createCardFn(task));
    })

    parent.appendChild(fragment);
  }

  static addClass(element, className) {
    if(!element || !className) {
      throw new Error(`Class '${className}' cannot be added on element ${element}`);
    }
    element.classList.add(className)
  }

  static removeClass(element, className) {
    if(!element || !className) {
      throw new Error(`Class '${className}' cannot be removed on element ${element}`);
    }
    element.classList.remove(className);
  }

  static clearElement(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  static createTaskCount(element, totalTask) {
    element.textContent = totalTask;
  }

  static createElement(elementName, text) {
    const element = document.createElement(elementName);
    if(text) {
      element.textContent = text; 
    }
    return element;
  }

  static createConfirmModal(text) {
    const fragment = document.createDocumentFragment();
    
    const modalDiv = document.createElement("div");
    modalDiv.id = "modal";
    modalDiv.className = "modal visible overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full";

    const modalBody = document.createElement("div");
    modalBody.className = "relative p-4 w-full max-w-md max-h-full";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "relative bg-white-100 rounded-lg shadow-sm dark:bg-slate-800";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id ="closeBtn";
    closeBtn.className = "close-btn absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer";

    closeBtn.innerHTML = `
      <svg class="close-svg w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path class="close-svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
      <span class="sr-only">Close modal</span>
    `;

    const contentDiv = document.createElement("div");
    contentDiv.className = "p-4 md:p-5 text-center";
    contentDiv.innerHTML = `
      <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
    `;
    const h3 = document.createElement("h3");
    h3.className = "mb-5 text-lg font-normal text-gray-500 dark:text-gray-400";
    h3.textContent = text;

    const yesBtn = document.createElement("button");
    yesBtn.type = "button";
    yesBtn.className = "yes-btn text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center";
    yesBtn.textContent = "Yes, Merge";

    const noBtn = document.createElement("button");
    noBtn.type = "button";
    noBtn.className = "no-btn py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700";
    noBtn.textContent = "No";

    contentDiv.appendChild(h3);
    contentDiv.appendChild(yesBtn);
    contentDiv.appendChild(noBtn);


    
    contentWrapper.appendChild(closeBtn);
    contentWrapper.appendChild(contentDiv);

    modalBody.appendChild(contentWrapper);
    modalDiv.appendChild(modalBody);
    fragment.appendChild(modalDiv);
    document.body.appendChild(fragment);
 
  }
}
