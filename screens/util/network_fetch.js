import { debbug_log } from "./debbug";

export const SafeFetch = async (
  url,
  methodUsed = "POST",
  headerContent = { "Content-Type": "application/json" },
  bodyPayload, //body payload need to be form of a json
  fullDebug = false
) => {
  //return "1" if error || response.json
  try {
    if (fullDebug) {
      debbug_log("= Info: SafeFetch started\n", "blue");
      debbug_log("fetching: " + url + "\n", "yellow");
      debbug_log("method: " + methodUsed + "\n", "yellow");
      debbug_log(
        "bodyPayload: " + JSON.stringify(bodyPayload) + "\n",
        "yellow"
      );
    }
    const response = await fetch(url, {
      method: methodUsed,
      headers: headerContent,
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      throw new Error(`Err ${response.status}`);
    }
    const data = await response.json();
    if (fullDebug) {
      debbug_log("= Success: SafeFetch finished sucessfully\n", "yellow");
      debbug_log("response raw: " + response);
    }
  } catch (error) {
    if (fullDebug) {
      debbug_log("X Error: SafeFetch -> " + error + ";", "red");
    }
  }
};
