import { runAppStatsCron } from "./appStats";

// Run all crons immediately on startup
runAppStatsCron();

// Schedule all crons
setInterval(runAppStatsCron, 1 * 60 * 60 * 1000); // every 1 hour

// Add more crons here as needed
