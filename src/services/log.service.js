export const APP_TYPE = {
    GLANCE_NOTES: 'GLANCE NOTES',
    PANEL_TASKS: 'PANEL TASKS',
    RENDER_MEMBERS: 'RENDER MEMBERS',
    MODAL_MEMBERS: 'MODAL MEMBERS',
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