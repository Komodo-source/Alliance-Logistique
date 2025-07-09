
export const debbug_log = (message, color = 'white', space = false) => {
    const colorCodes = {
      black: 30,
      red: 31,
      green: 32,
      yellow: 33,
      blue: 34,
      magenta: 35,
      cyan: 36,
      white: 37,
    };
  
    const code = colorCodes[color.toLowerCase()] || colorCodes.white;
    if (space) {
      console.log(" ")
    }
    
    console.log(`\x1b[${code}m%s\x1b[0m`, message);
    
  };
