class RoomManager {
  constructor() {
    this.rooms = new Map(); 
  }

  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { users: new Set(), drawingState: [] });
    }
    return this.rooms.get(roomId);
  }
}

module.exports = RoomManager;
