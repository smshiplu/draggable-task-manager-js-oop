import "./index.css";
import "toastify-js/src/toastify.css";

import { TaskService } from "./services/taskService";
import { TaskUI } from "./ui/taskUI";


class TaskApp {
  constructor() {
    this.taskService = new TaskService();
    this.ui = null;
  }

  init() {
    try {
      this.ui = new TaskUI(this.taskService);
      console.log("Task App Initialized Successfully!");
      
    } catch (error) {
      console.log("Initialization Error", error instanceof Error ? error.message : error);
    }
  }
}

let taskApp; 

document.addEventListener("DOMContentLoaded", () => {
  taskApp = new TaskApp();
  taskApp.init();
});

window.addEventListener("load", () => {
  if(!taskApp) {
    taskApp = new TaskApp();
    taskApp.init();
  }
})