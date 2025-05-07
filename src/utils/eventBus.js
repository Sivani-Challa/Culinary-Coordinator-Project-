// src/utils/eventBus.js
const eventBus = {
    events: {},
    
    // Subscribe to an event
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    },
    
    // Unsubscribe from an event
    off(event, callback) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    },
    
    // Emit an event
    emit(event, data) {
      if (!this.events[event]) return;
      this.events[event].forEach(cb => cb(data));
    }
  };
  
  export default eventBus;