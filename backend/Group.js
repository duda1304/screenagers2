module.exports = class Group {
  constructor(name, io) {
    this.name = name;
    this.io = io;
    this.group = new Set();
  }

  add(id) {
    this.group.add(id);
    // console.log('Group: add ' + id + ' to group ' + this.name);
  }

  remove(id) {
    this.group.delete(id);
    // console.log('Group: remove ' + id + ' from group ' + this.name);
  }

  emit(msg, data) {
    // console.log("Group: send msg '" + msg + "' to group " + this.name);
    this.group.forEach(val => {
      if (val in this.io.sockets.connected) {
        this.io.sockets.connected[val].emit(msg, data);
      }
    });
  }
};
