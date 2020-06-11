export const APP_TYPE = {
    GLANCE_NOTES: 'GLANCE NOTES',
    PANEL_TASKS: 'PANEL TASKS',
    PANEL_MEMBERS: 'PAANEL MEMBERS',
    TIME_TRACKER: 'TIME TRACKER'
}

export function logInfo(appType, message) {
    console.info(`${appType} - ${message}`);
}

export function logError(appType, message) {
    console.error(`${appType} - ${message}`);
}

export function logWarning(appType, message) {
    console.warn(`${appType} - ${message}`);
}

export function getPrettyfiedJSON(jsonObject) {
    return JSON.stringify(jsonObject, null, 2);
}