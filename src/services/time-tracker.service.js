import api from '@forge/api';
import { to } from 'await-to-js';

import { logInfo, logError, getPrettyfiedJSON, APP_TYPE } from './log.service';

const storedDataKey = 'regosJIRAToolkitTimeTracker_';

export const getUserTimeTracks = async (issueKey, accountId) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);

    logInfo(APP_TYPE.TIME_TRACKER, `Get Time Tracks for user: ${accountId}, Issue Key: ${issueKey} and Datakey: ${storedDataKey}${accountId}`);

    const [error, timeTrackerData] = await to(api.store.onJiraIssue(issueKey).get(`${storedDataKey}${accountId}`));

    if (error) {
        logError(APP_TYPE.TIME_TRACKER, `Error loading time trackers for user: ${accountId} and Issue Key: ${issueKey}. Reason: ${error}`);
        //TODO: Show notification to user ?
        return null;
    }

    logInfo(APP_TYPE.TIME_TRACKER, `Loaded time tracker for user: ${accountId} and Issue Key: ${issueKey}. Data:  ${getPrettyfiedJSON(timeTrackerData)}`);

    if (timeTrackerData)
        return timeTrackerData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return timeTrackerData || [];
}

export const addTimeTracker = async (issueKey, accountId, newTrack, allTimeTrackers) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);

    const tracks = allTimeTrackers.map(x => x);
    tracks.push(newTrack);

    const updatedTracks = await updateTimeTrackers(issueKey, accountId, tracks);

    if (updatedTracks) {
        return tracks;
    }
    else {
        return allTimeTrackers;
    }
}

export const updateTimeTrackers = async (issueKey, accountId, allTimeTrackers) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);
    
    const [error,] = await to(api.store.onJiraIssue(issueKey).set(`${storedDataKey}${accountId}`, allTimeTrackers.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))));

    if (error) {
        logError(APP_TYPE.TIME_TRACKER, `Error updating time trackers for user: ${accountId}, Issue Key: ${issueKey} and Tracks: ${JSON.stringify(allTimeTrackers)}. Reason: ${JSON.stringify(error)} - ${error}.`);
        return false;
    }

    logInfo(APP_TYPE.TIME_TRACKER, `Time trackers updated successfully for user: ${accountId}, Issue Key: ${issueKey} and Tracks: ${JSON.stringify(allTimeTrackers)}.`)
    return true;
}

const replaceInvalidCharsForObjectKey = (text) => {
    return text.replace(/[:-]/gi, '_');
}