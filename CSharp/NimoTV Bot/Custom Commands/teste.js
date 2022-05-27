module.exports = (callback, x, y) => {  // Module must export a function that takes a callback as its first parameter
    var result = x + y; // Your javascript logic
    callback(null /* If an error occurred, provide an error object or message */, result); // Call the callback when you're done.
}