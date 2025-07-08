import * as FileSystem from 'expo-file-system';
import * as debbug_lib from './debbug.js';

export const create_file = async (file_name, content = "") => {
  try {
    const fileUri = FileSystem.documentDirectory + file_name;
    
    await FileSystem.writeAsStringAsync(fileUri, content); // This creates or overwrites the file
    
    debbug_lib.debbug_log("[FM] File created: " + file_name, "green");
  } catch (error) {
    debbug_lib.debbug_log("[FM] Error in file creation: " + error.message, "red");
  }
};

export const is_file_existing = async (file_name) => {
  const fileUri = FileSystem.documentDirectory + file_name; 
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  
  if (!fileInfo.exists) {
    console.warn('Fichier inexistant:', fileUri);
    return false;
  }return true;
}

export const delete_file = async (file_name) => {
  try {
    const fileUri = FileSystem.documentDirectory + file_name;
    await FileSystem.deleteAsync(fileUri);
    debbug_lib.debbug_log("[FM] File has been deleted Succefully", "green");
  }catch (error){
    debbug_lib.debbug_log("[FM] File " + file_name + " couldn't be deleted, err: " + error, "red");
  }
  
}

export const save_storage_local_storage_data = async (data, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] save_storage_local_storage_data", "yellow");
    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
    if (!dirInfo.exists) {
      console.log("Document directory doesn't exist");
      return;
    }
    
    const fileUri = FileSystem.documentDirectory + file_name;
    console.log('Data:', data);
    const jsonString = JSON.stringify(data);
    
    console.log('Full file path:', fileUri);
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      console.log('fichier ecris:', fileInfo.uri, 'Size:', fileInfo.size);

      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      console.log('File contents:', fileContents);
    } else {
      console.log('File write operation completed but file not found');
    }
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }      
};

export const save_storage_local_storage_response = async (response, file_name) => {
  try {    
    debbug_lib.debbug_log("[FM] save_storage_local_storage_data", "yellow");
    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
    if (!dirInfo.exists) {
      console.log("Document directory doesn't exist");
      return;
    }
    const data = await response.json();
    const fileUri = FileSystem.documentDirectory + file_name;
    console.log('Data:', data);
    const jsonString = JSON.stringify(data);
    
    console.log('Full file path:', fileUri);
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      console.log('fichier ecris:', fileInfo.uri, 'Size:', fileInfo.size);

      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      console.log('File contents:', fileContents);
    } else {
      console.log('File write operation completed but file not found');
    }
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }      
};

// FIXED: Now actually modifies existing data instead of overwriting
export const modify_value_local_storage = async (key, value, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] modify_value_local_storage", "yellow");
    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
    if (!dirInfo.exists) {
      console.log("Document directory doesn't exist");
      return;
    }

    const fileUri = FileSystem.documentDirectory + file_name;
    let existingData = {};

    // Read existing data first
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      try {
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        existingData = JSON.parse(fileContents);
      } catch (parseError) {
        console.warn('Failed to parse existing file, starting with empty object.');
        existingData = {};
      }
    }

    // Only modify the specific key
    existingData[key] = value;
    const jsonString = JSON.stringify(existingData);

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const updatedFileInfo = await FileSystem.getInfoAsync(fileUri);
    if (updatedFileInfo.exists) {
      console.log('File modified:', updatedFileInfo.uri, 'Size:', updatedFileInfo.size);
      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      console.log('File contents:', fileContents);
    } else {
      console.log('File modification completed but file not found');
    }
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }
};

// FIXED: Now prevents overwriting existing keys
export const add_value_to_local_storage = async (key, value, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] add_value_to_local_storage", "yellow");
    const fileUri = FileSystem.documentDirectory + file_name;
    let existingData = {};

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      try {
        existingData = JSON.parse(fileContents);
      } catch (parseError) {
        console.warn('Failed to parse existing file, will overwrite with new object.');
      }
    }

    // Check if key already exists
    if (existingData.hasOwnProperty(key)) {
      console.warn(`Key "${key}" already exists. Use modify_value_local_storage to update existing keys.`);
      return false; // Indicate that the operation was not performed
    }

    existingData[key] = value;

    const jsonString = JSON.stringify(existingData);

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });

    console.log(`Added key "${key}" with value "${value}" to`, fileUri);
    return true; // Indicate success
  } catch (error) {
    console.error('Error while adding value to local storage:', error);
    return false;
  }
};

export const read_file = async (file_name, if_not_create=false) => {
  try {
    debbug_lib.debbug_log("[FM] read_file", "yellow");
    const fileUri = FileSystem.documentDirectory + file_name; 
    console.log('lecture du fichier:', fileUri);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      console.warn('Fichier inexistant:', fileUri);
      if(if_not_create){
        await create_file(file_name);
        debbug_lib.debbug_log("[FM] created file", "yellow");
      }else{
        return null;
      }
      
    }

    const fileContents = await FileSystem.readAsStringAsync(fileUri);
    console.log('Contenu du fichier:', fileContents);

    const parsedData = JSON.parse(fileContents);
    console.log('Parse du json:', parsedData);
    
    return parsedData;
  } catch (error) {
    console.error('Error reading file:', error);
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON - file may be corrupted');
    } else if (error.code === 'ENOENT') {
      console.error('File not found - path may be incorrect');
    }
    
    return null;
  }
};

// BONUS: Additional utility functions you might find useful

export const delete_key_from_local_storage = async (key, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] delete_key_from_local_storage", "yellow");
    const fileUri = FileSystem.documentDirectory + file_name;
    let existingData = {};

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.warn('File does not exist:', fileUri);
      return false;
    }

    const fileContents = await FileSystem.readAsStringAsync(fileUri);
    try {
      existingData = JSON.parse(fileContents);
    } catch (parseError) {
      console.error('Failed to parse existing file');
      return false;
    }

    if (!existingData.hasOwnProperty(key)) {
      console.warn(`Key "${key}" does not exist in the file`);
      return false;
    }

    delete existingData[key];

    const jsonString = JSON.stringify(existingData);
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });

    console.log(`Deleted key "${key}" from`, fileUri);
    return true;
  } catch (error) {
    console.error('Error while deleting key from local storage:', error);
    return false;
  }
};

export const check_key_exists = async (key, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] check_key_exists", "yellow");
    const data = await read_file(file_name);
    if (data === null) return false;
    
    return data.hasOwnProperty(key);
  } catch (error) {
    console.error('Error checking if key exists:', error);
    return false;
  }
};