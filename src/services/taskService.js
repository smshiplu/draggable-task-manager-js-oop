import { Task } from "../models/task";

export class TaskService {
  constructor() {
    this.tasks = this.getStorageData();
  }

  addTask(title) {
    if (!title.trim()) {
      throw new Error("Task title cannot be empty!");
    }

    if (this.tasks.has(title)) {
      throw new Error("Task title already exists!");
    }

    const task = new Task(title);

    this.tasks.set(title, task);
    
    return task;
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  countAllTask() {
    return this.tasks.size;
  }

  getTasksByStatus(status) {
    const tasks = this.getAllTasks();
    const tasksByStatus = tasks.filter(task => task.status === status);
    return tasksByStatus;
  }

  countTaskByStatus(status) {
    const tasks = this.getAllTasks().filter(task => task.status === status);
    return tasks.length;
  }

  deleteTask(title) {
    return this.tasks.delete(title);
  }

  updateTask(title, newTitle) {    
    if (!this.tasks.has(title)) {
      throw new Error("Title doesn't exists to update task!");
    }

    const task = this.tasks.get(title);
    task.title = newTitle;

    this.tasks.set(newTitle, task);
    this.tasks.delete(title);
    
    return task;
  }

  moveTask(title, status) {
    if (!this.tasks.has(title)) {
      throw new Error("Title doesn't exists to update task!");
    }

    const task = this.tasks.get(title);
    
    task.status = status;

    const updatedTask = this.tasks.set(title, task);
    return updatedTask;
  }

  getStorageData() {
    const storageData = JSON.parse(localStorage.getItem("task-manager-oop")) || [];
    if(storageData.length > 0) {
      const mapData = storageData.map(item => [item.title, item]);
      return new Map(mapData);
    } else {
      return new Map();
    }
  }

  saveData() {
    let savableData = arguments[0] && arguments[0].length > 0 ? arguments[0] : this.getAllTasks()
    localStorage.setItem("task-manager-oop", JSON.stringify(savableData));
    return savableData;
  }

}