exports.main = async (event) => {
    const name = event.name || "World";
    return {
        message: `Hello, ${name} from Node.js Runtime!`,
        timestamp: new Date().toISOString()
    };
};