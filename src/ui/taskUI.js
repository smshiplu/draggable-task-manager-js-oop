import { DOMHelpers } from "./DOMHelpers";
import { successMessage, errorMessage  } from "../utils/toast";
import FaviconIcon from "../../favicon.svg";
export class TaskUI {
  constructor(taskService) {
    this.taskService = taskService;
    this.keyName = null;

    this.storageData = localStorage.getItem("task-manager-oop-theme") || null;
    
    this.initializeElements();
    this.bindingEvents();
    this.loadTheme();
  }

  initializeElements() {
    this.elements = {
      faviconIcon: DOMHelpers.getElementById("favicon"),
      addTaskFormWrapper: DOMHelpers.getElementById("addTaskFormWrapper"),
      addTaskForm: DOMHelpers.getElementById("addTaskForm"),
      addTaskInput: DOMHelpers.getElementById("addTaskInput"),
      editTaskFormWrapper: DOMHelpers.getElementById("editTaskFormWrapper"),
      editTaskForm: DOMHelpers.getElementById("editTaskForm"),
      editTaskInput: DOMHelpers.getElementById("editTaskInput"),
      cancelEditTaskBtn: DOMHelpers.getElementById("cancelEditTaskBtn"),
      pendingTaskResult: DOMHelpers.getElementById("pendingTaskResult"),
      ongoingTaskResult: DOMHelpers.getElementById("ongoingTaskResult"),
      completedTaskResult: DOMHelpers.getElementById("completedTaskResult"),
      pendingTaskCount: DOMHelpers.getElementById("pendingTaskCount"),
      ongoingTaskCount: DOMHelpers.getElementById("ongoingTaskCount"),
      completedTaskCount: DOMHelpers.getElementById("completedTaskCount"),
      resultDivs: DOMHelpers.querySelectorAll(".result"),
      taskCountNodes: DOMHelpers.querySelectorAll(".task-count"),
      exportBtn: DOMHelpers.getElementById("exportBtn"),
      importBtn: DOMHelpers.getElementById("importBtn"),
      themeBtn: DOMHelpers.getElementById("themeBtn"),
      html: DOMHelpers.getElementById("html")
    }     
  }

  bindingEvents() {
    window.addEventListener("load", () => {
      this.elements.faviconIcon.href = FaviconIcon;
    });

    this.elements.addTaskForm.addEventListener("submit", (e) => {
      this.handleAddTask(e);
    });

    this.elements.cancelEditTaskBtn.addEventListener("click", () => {
      this.hideEditTaskForm();
    });
    
    this.elements.editTaskForm.addEventListener("submit", (e) => {
      this.editTask(e);
    });

    this.elements.resultDivs.forEach((resultDiv, index) => {

      const tasks = this.taskService.getAllTasks();
      const elementId = resultDiv.getAttribute("id");
      this.renderDefaultTask(elementId, tasks, index);

      resultDiv.addEventListener("click", (event) => {
        const btn = event.target;

        if(event.target.tagName === "BUTTON" && event.target.classList.contains("moveBtn")) {
          this.handleToolTip(btn);
        }

        if(event.target.tagName === "BUTTON" && event.target.classList.contains("deleteBtn")) {
          this.handleDelete(btn);
        }

        if(event.target.tagName === "BUTTON" && event.target.classList.contains("editBtn")) {
          this.handleTaskEdit(btn);
        }

        if(event.target.tagName === "BUTTON" && event.target.classList.contains("tooltip-btn")) {
          const title = btn.parentElement.parentElement.parentElement.dataset.title;
          const whereToMove =  event.target.dataset.move;
          this.handleMoveTask(title, whereToMove);
        }
      });
      
      resultDiv.addEventListener("dragstart", (e) => {
        if(e.target.classList.contains("card")) {
          e.target.classList.add("dragging");
        }
      });

      resultDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        const card = document.querySelector(".dragging");
        resultDiv.appendChild(card);
      });

      resultDiv.addEventListener("dragend", (e) => {
        e.preventDefault();

        const title = e.target.dataset.title.trim();
        
        switch (index) {
          case 0:
            // move to pending
            this.taskService.moveTask(title, "pending");
            this.taskService.saveData();
            this.renderTaskCount();
            break;

          case 1:
            // move to ongoing
            this.taskService.moveTask(title, "ongoing");
            this.taskService.saveData();
            this.renderTaskCount();
            break;

          case 2:
            // move to completed
            this.taskService.moveTask(title, "completed");
            this.taskService.saveData();
            this.renderTaskCount();
            break;
        
          default:
            break;
        }

        e.target.classList.remove("dragging");
      });
    });

    this.elements.exportBtn.addEventListener("click", () => {
      this.handleFileExport();
    });

    this.elements.importBtn.addEventListener("click", () => {
      this.handleFileImport();
    });

    this.elements.themeBtn.addEventListener("click", () => {
      this.handleTheme();
    })
  } // bindingEvents()

  handleAddTask(e) {
    e.preventDefault();

    try {
      const title = this.elements.addTaskInput.value.trim();
      
      if(!title) {
        throw new Error("Task title cannot be empty!");
      }

      const task = this.taskService.addTask(title);

      if(Object.keys(task).length <= 0) {
        throw new Error("Task didn't created!");
      }

      const tasks = this.taskService.getTasksByStatus("pending");
      
      this.taskService.saveData();

      this.renderTask(this.elements.pendingTaskResult, tasks);
      DOMHelpers.createTaskCount(this.elements.pendingTaskCount, this.taskService.countTaskByStatus("pending"));

      successMessage(`Task created successfully!`)
      this.elements.addTaskForm.reset();

    } catch (error) {
      console.log("Task Adding", error);
      errorMessage(`${error.message}`);
    }
  }

  renderTask(parent, tasks, tooltipOptions= [{name: "Ongoing 🏃‍♀️", moveTo: 1},{name: "Completed ✔", moveTo: 2}]) {

    // DOMHelpers.createCard(this.elements.pendingTaskResult, task, tooltipOptions);
    DOMHelpers.clearElement(parent);
    DOMHelpers.appendFragment(parent, tasks, (task) => DOMHelpers.createCard(task, tooltipOptions));
  }

  handleToolTip(moveBtn) {
    const tooltip = moveBtn.childNodes[1];

    if(tooltip.classList.contains("hidden")) {
      DOMHelpers.removeClass(tooltip, "hidden");
      DOMHelpers.addClass(tooltip, "inline-block");
    } else {
      DOMHelpers.removeClass(tooltip, "inline-block");
      DOMHelpers.addClass(tooltip, "hidden");
    }
  }

  handleMoveTask(title, whereToMove) {

    let moveTo;
    switch (whereToMove) {
      case "0":
        moveTo = "pending"
        break;

      case "1":
        moveTo = "ongoing"
        break;

      case "2":
        moveTo = "completed"
        break;
    
      default:
        break;
    }

    this.taskService.moveTask(title, moveTo);
    this.taskService.saveData();

    this.elements.resultDivs.forEach((div, index) => {
      const elementId = div.id;
      this.renderDefaultTask(elementId, this.taskService.getAllTasks(), index);
    })

  }

  handleDelete(btn) {
    const taskTitle = btn.dataset.title;
    try {
      if(!this.taskService.deleteTask(taskTitle)) {
        throw new Error("Task deletion error");
      }
      this.taskService.saveData();

      const tasks = this.taskService.getAllTasks();
      this.elements.resultDivs.forEach((element, index) => {
        const elementId = element.id
        this.renderDefaultTask(elementId, tasks, index)
      })

    } catch (error) {
      console.log("Delete error", error);
      errorMessage(error.message);
    }
  }

  handleTaskEdit(btn) {
    this.keyName = btn.dataset.title;
    this.hideAddTaskForm();

    this.elements.editTaskFormWrapper.scrollIntoView({ behavior: "smooth", block: "start"});

    this.elements.editTaskInput.value = btn.dataset.title;
    this.elements.editTaskInput.focus();
  }

  hideEditTaskForm() {
    this.keyName = null;
    DOMHelpers.removeClass(this.elements.addTaskFormWrapper, "hidden");
    DOMHelpers.addClass(this.elements.editTaskFormWrapper, "hidden");
    this.elements.editTaskInput.value = "";
    this.elements.editTaskForm.reset();
  }
  
  hideAddTaskForm() {
    DOMHelpers.addClass(this.elements.addTaskFormWrapper, "hidden");
    DOMHelpers.removeClass(this.elements.editTaskFormWrapper, "hidden");
    this.elements.addTaskInput.value = "";
    this.elements.addTaskForm.reset();
  }

  editTask(e) {
    e.preventDefault();

    try {

      if(!this.keyName) {
        throw new Error("No task found to update!");
      }

      const newTitle = this.elements.editTaskInput.value.trim();
      
      if(!newTitle) {
        throw new Error("Task title cannot be empty to update!");
      }
      
      const task = this.taskService.updateTask(this.keyName, newTitle);
      
      if (Object.keys(task).length <= 0) {
        throw new Error("Task update cannot be done!");
      } 

      this.hideEditTaskForm();

      this.elements.resultDivs.forEach((resultDiv, index) => {
        const elementId = resultDiv.getAttribute("id");
        this.taskService.saveData();
        this.renderDefaultTask(elementId, this.taskService.getAllTasks(), index);
      });

      successMessage("Task updated successfully!");

    } catch (error) {
      console.log("Task update error:", error);
      errorMessage(error.message);
    }
    
  }

  renderDefaultTask(elementId, tasks, index) {

    let taskData;
    let tooltipData;

    switch (elementId) {
      case "pendingTaskResult":
        taskData = tasks.filter(task => task.status === "pending");
        this.renderTask(this.elements.pendingTaskResult, taskData);
        this.elements.taskCountNodes[index].textContent = taskData.length;
        break;

      case "ongoingTaskResult":
        taskData = tasks.filter(task => task.status === "ongoing");
        tooltipData = [{name: "Pending ⌛", moveTo: 0}, {name: "Completed ✔", moveTo: 2}];
        this.renderTask(this.elements.ongoingTaskResult, taskData, tooltipData);
        this.elements.taskCountNodes[index].textContent = taskData.length;
        break;

      case "completedTaskResult":
        taskData = tasks.filter(task => task.status === "completed");
        tooltipData = [{name: "Pending ⌛", moveTo: 0},{name: "Ongoing 🏃‍♀️", moveTo: 1}];
        this.renderTask(this.elements.completedTaskResult, taskData, tooltipData);
        this.elements.taskCountNodes[index].textContent = taskData.length;
        break;
    
      default:
        break;
    }
  }

  renderTaskCount() {
    this.elements.taskCountNodes.forEach(node => {
      if(node.id === "pendingTaskCount") {
        DOMHelpers.createTaskCount(this.elements.pendingTaskCount, this.taskService.countTaskByStatus("pending"));
      }

      if(node.id === "ongoingTaskCount") {
        DOMHelpers.createTaskCount(this.elements.ongoingTaskCount, this.taskService.countTaskByStatus("ongoing"));
      }

      if(node.id === "completedTaskCount") {
        DOMHelpers.createTaskCount(this.elements.completedTaskCount, this.taskService.countTaskByStatus("completed"));
      }
    })
  }

  handleFileExport() {
    const tasks = this.taskService.getAllTasks();
    this.exportFile(tasks);
  }

  exportFile(exportData) {
    const jsonString = JSON.stringify(exportData, null, 2); // null and 2 for pretty-printing

    const blob = new Blob([jsonString], { type: 'application/json' });

    const fileUrl = URL.createObjectURL(blob);
    const fileName = "tasks.json";

    const link = DOMHelpers.createElement('a');
    link.href = fileUrl;
    link.download = fileName;

    // Append to body (optional, but ensures it's in the DOM for programmatic click)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    document.body.removeChild(link); // Remove anchor tag after click
    URL.revokeObjectURL(fileUrl); // Clean up the object URL
  }

  handleFileImport() {
    // create file input element and trigger click event
    const input = DOMHelpers.createElement("input");
    input.type = "file";
    input.click();

    input.addEventListener("change", e => this.prepareImport(e));

  }

  prepareImport(e) {
    try {
      const files = e.target.files;
      if(files.length > 0) {
        const file =  e.target.files[0];
        if(!file) {
          throw new Error(`No file found to read data!`);
        }

        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
          this.importFile(e);
        });

        // Read the file as text (you can also use readAsDataURL, readAsArrayBuffer, etc.)
        reader.readAsText(file);

        successMessage(`Data successfully loaded from the file ${file.name}`);
      }

    } catch (error) {
      console.log("File export error:", error);
      errorMessage(error.message);
    }
    e.target.remove();
    e.target.removeEventListener("change", this.prepareImport)
  }

  importFile(e) {
    const importedData = JSON.parse(e.target.result); // The file content
    
    for (const task of importedData) {
      if(
        !task.hasOwnProperty("id") ||
        !task.hasOwnProperty("title") ||
        !task.hasOwnProperty("status") ||
        !task.hasOwnProperty("timestamp")
      ) {
        throw new Error("Invalid data formate!");
      }
    }
  
    if(importedData.length > 0 && this.taskService.countAllTask() > 0) {

      DOMHelpers.createConfirmModal("Do you want to merge imported data with current data?", true);
     
      const modal = DOMHelpers.getElementById("modal");

      modal.addEventListener("click", (e) => this.handleModal(e, importedData));
    } 
    else if(importedData.length > 0) {
      this.importAndRenderTask(importedData);
    }

  }

  handleModal(e, importedData) {
    let confirmValue;
    if(
      e.target.classList.contains("modal") || 
      e.target.tagName === "BUTTON" && e.target.classList.contains("close-btn") ||
      e.target.tagName === "svg" && e.target.classList.contains("close-svg") ||
      e.target.tagName === "path" && e.target.classList.contains("close-svg")
    ) document.body.removeChild(modal);

    if( e.target.tagName === "BUTTON" && e.target.classList.contains("yes-btn")) {
      document.body.removeChild(modal);
      confirmValue = true;
    }

    if( e.target.tagName === "BUTTON" && e.target.classList.contains("no-btn")) {
      document.body.removeChild(modal);
      confirmValue = false;
    }

    if(confirmValue) {
      // merge data
      this.mergeImportAndRenderTask(importedData);      
    } else {
      // store imported data
      this.importAndRenderTask(importedData);
    }

    e.target.removeEventListener("click", this.handleModal);
  }

  mergeImportAndRenderTask(importedData) {
    const tasks = this.taskService.getAllTasks();
    const combinedArray = tasks.concat(importedData);

    const mergedMap = new Map();
    
    for (const task of combinedArray) {
      if(!mergedMap.has(task.title)) {
        mergedMap.set(task.title, task);
      }
    }

    const uniqueTasks = Array.from(mergedMap.values());
    const savedTask = this.taskService.saveData(uniqueTasks);
    
    this.elements.resultDivs.forEach((div, index) => {
      const elementId = div.id;
      this.renderDefaultTask(elementId, savedTask, index);
    });

    mergedMap.delete();
  }

  importAndRenderTask(importedData) {
    this.taskService.saveData(importedData);

    this.elements.resultDivs.forEach((div, index) => {
      const elementId = div.id;
      this.renderDefaultTask(elementId, importedData, index);
    });
  }

  handleTheme() {
    // check for dark class
    const storageData = localStorage.getItem("task-manager-oop-theme");

    if(this.elements.html.classList.contains("dark")) {
      DOMHelpers.removeClass(this.elements.html, "dark");
      localStorage.setItem("task-manager-oop-theme", null);
    } else {
      DOMHelpers.addClass(this.elements.html, "dark");
      localStorage.setItem("task-manager-oop-theme", "dark");
    }

  }

  loadTheme() {
    if(this.storageData === "dark") {
      DOMHelpers.addClass(this.elements.html, "dark");
    } else {
      DOMHelpers.removeClass(this.elements.html, "dark");
    }
  }

} // taskUI