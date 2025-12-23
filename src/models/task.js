export class Task {
  constructor(title, status="pending") {
    this.title = title.trim();
    if(!this.title) {
      throw new Error("Task title cannot be empty!");
    }
    this.status = status;
    this.id = this.generateId();
    this.timestamp = new Date().toISOString();
  }

  generateId() {
    return crypto.randomUUID();
  }

  getJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      timestamp: this.timestamp
    }
  }
}