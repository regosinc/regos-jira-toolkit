import ForgeUI, { render, IssueGlance, useProductContext, Text, Button, useState, Fragment, Table, Head, Row, Cell, StatusLozenge, ModalDialog, Form } from '@forge/ui';
import moment from 'moment-timezone';
import uuid from 'v4-uuid';
import humanizeDuration from 'humanize-duration';

import { logInfo, getPrettyfiedJSON, APP_TYPE, logWarning } from './services/log.service';
import { getUserTimeTracks, addTimeTracker, updateTimeTrackers } from './services/time-tracker.service';
import { getTimezone } from './services/common.service';

const App = () => {
  // Context data
  const context = useProductContext();
  const issueKey = context.platformContext.issueKey;
  const [trackingInfo, setTrackingInfo] = useState({});
  const [isTracking, setIsTracking] = useState(false);
  const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState({});
  const [currentTimeTracked, setCurrentTimeTracked] = useState('');
  const timeOptions = {
    round: true,
    delimiter: ", ",
    spacer: ""
  }
  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: "shortEn",
    languages: {
      shortEn: {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
      },
    },
  });

  const accountId = context.accountId;

  // Read user stored data
  const getTracks = async () => {
    logInfo(APP_TYPE.TIME_TRACKER, `Getting tracks  for ${issueKey} and user: ${accountId}.`);
    let tracks = await getUserTimeTracks(issueKey, accountId);

    if (tracks) {
      const startedTrack = tracks.find(t => !t.endTime);

      if (startedTrack) {
        logInfo(APP_TYPE.TIME_TRACKER, `The user had a previous unfinished track: ${getPrettyfiedJSON(startedTrack)}.`);
        tracks = tracks.filter(t => t.endTime);
        setTrackingInfo(startedTrack);
        setIsTracking(true);
      } else {
        logInfo(APP_TYPE.TIME_TRACKER, `All tracks were finished.`);
      }

      return tracks;
    }

    return [];
  }

  const [storedTracks, setStoredTracks] = useState(async () => await getTracks(issueKey, accountId));
  const [timeZone, setTimeZone] = useState(async () => await getTimezone());

  logInfo(APP_TYPE.TIME_TRACKER, `Issue Key: ${issueKey}`);

  const createNewTrack = async () => {
    const newTrackInfo = {
      id: uuid(),
      startTime: new Date(),
      endTime: null,
    }

    const updatedTracks = await addTimeTracker(issueKey, accountId, newTrackInfo, storedTracks);

    //setStoredTracks(updatedTracks.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    setTrackingInfo(newTrackInfo);
    setIsTracking(true);

    logInfo(APP_TYPE.TIME_TRACKER, `Started tracking ${issueKey} by ${accountId} at: ${new Date()}.`);
  }

  const stopTracking = async () => {
    console.log(APP_TYPE.TIME_TRACKER, `Stopped tracking ${issueKey} by ${accountId} at: ${trackingInfo.endTime}. Total Time tracked: ${trackingInfo.totalTime} seconds.`);
    //clearInterval(interval);

    trackingInfo.endTime = new Date();
    trackingInfo.totalTime = Math.round((new Date(trackingInfo.endTime).getTime() - new Date(trackingInfo.startTime).getTime()) / 1000);

    const updatedTracks = await addTimeTracker(issueKey, accountId, trackingInfo, storedTracks);

    setStoredTracks(updatedTracks.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));

    console.log(APP_TYPE.TIME_TRACKER, `Track created for ${issueKey} by ${accountId} at: ${trackingInfo.endTime}. Total Time tracked: ${trackingInfo.totalTime} seconds.`);

    setTrackingInfo({});
    setIsTracking(false);

  }

  const deleteTrack = async () => {
    logInfo(APP_TYPE.TIME_TRACKER, `Delete Track: ${trackToDelete.id}`);

    const tracksWithRemoved = storedTracks.filter(x => x.id !== trackToDelete.id);

    const result = await updateTimeTrackers(issueKey, accountId, tracksWithRemoved);

    if (result) {
      setStoredTracks(tracksWithRemoved);
      setTrackToDelete({});
      setModalDeleteOpen(false);
    }
    //else 
    // TODO: Show notification ? 
  }

  const getTotalTime = () => {
    var totalTime = 0;
    storedTracks.forEach(track => {
      totalTime += track.totalTime;
    });

    logInfo(APP_TYPE.TIME_TRACKER, `Total Time: ${totalTime}`);

    return ` ${shortEnglishHumanizer(totalTime * 1000, timeOptions)}`;
  }

  const refreshTimer = () => {
    setCurrentTimeTracked(shortEnglishHumanizer(new Date().getTime() - new Date(trackingInfo.startTime).getTime(), timeOptions));
  }

  return (
    <Fragment>
      <Button text={!isTracking ? 'Start Tracking' : 'Stop Tracking'} onClick={!isTracking ? createNewTrack : stopTracking}></Button>
      {isTracking && <Text>**You are currently tracking the time on this issue. Click on the button to see the current time spent**</Text>}

      {isTracking && <Button text={`↻  Spent Time${currentTimeTracked ? ': ' + currentTimeTracked : ''}`} onClick={refreshTimer}></Button>}

      {/* No Time Tracks */}
      {storedTracks && storedTracks.length == 0 && <Text>You don't have any time register yet</Text>}

      {storedTracks && storedTracks.length > 0 &&
        <Fragment>
          <Text>**Total Time spent on the Issue:**<StatusLozenge text={getTotalTime()} appearance="success" /></Text>

          <Table>
            <Head>
              <Cell>
                <Text content="Time" />
              </Cell>
              <Cell>
                <Text content="Started" />
              </Cell>
              <Cell>
                <Text content="Finished" />
              </Cell>
              <Cell>
                <Text content="" />
              </Cell>
            </Head>
            {storedTracks.map(track => (
              <Row>
                <Cell>
                  <Text content={`**${shortEnglishHumanizer(track.totalTime * 1000, timeOptions)}**`} />
                </Cell>
                <Cell>
                  <Text content={`_${moment(track.startTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').substring(0, moment(track.startTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').indexOf(' '))}_ ${moment(track.startTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').substring(moment(track.startTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').indexOf(' ') + 1)}`} />
                </Cell>
                <Cell>
                <Text content={`_${moment(track.endTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').substring(0, moment(track.endTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').indexOf(' '))}_ ${moment(track.endTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').substring(moment(track.endTime).tz(timeZone).format('MM/DD/YY HH:mm:ss').indexOf(' ') + 1)}`} />
                </Cell>

                <Cell>
                  <Button text="⨯" onClick={() => { setModalDeleteOpen(true); setTrackToDelete(track); }} />
                </Cell>
              </Row>
            ))}
          </Table>
        </Fragment>
      }

      {/* Delete modal */}
      {
        isModalDeleteOpen && (
          <ModalDialog header="Delete Track" onClose={() => setModalDeleteOpen(false)}>
            <Form onSubmit={deleteTrack} submitButtonText="Delete">
              <Text>**Are you sure you want to delete the track data from:** {moment(trackToDelete.startTime).format('MM/DD/YY HH:mm:ss')} **to** {moment(trackToDelete.endTime).format('MM/DD/YY HH:mm:ss')} **?**</Text>
            </Form>
          </ModalDialog>
        )
      }

    </Fragment>
  );
};

export const run = render(
  <IssueGlance>
    <App />
  </IssueGlance>
);