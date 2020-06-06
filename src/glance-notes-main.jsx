import ForgeUI, { render, IssueGlance, Fragment, Button, Form, useAction, TextArea, useProductContext, useState, ModalDialog, Text } from '@forge/ui';
import moment from 'moment';

import { logInfo, logError, getPrettyfiedJSON, APP_TYPE } from './services/log.service';
import { getUserNotes, createUserNote } from './services/notes.service';

const App = () => {
  // Modal
  const [isModalOpen, setModalOpen] = useState(false);

  // Context data
  const context = useProductContext();
  const accountId = context.accountId;
  const issueKey = context.platformContext.issueKey;

  logInfo(APP_TYPE.GLANCE_NOTES, `Account Id: ${accountId} - Issue Key: ${issueKey}`);

  // Read user stored data
  const [storedNotes, setStoredNotes] = useState(async () => await getUserNotes(issueKey, accountId));

  // // useAction is a Forge UI hook we use to manage the form data in local state
  // const [note, setNote] = useAction(
  //   (_, newNote) => newNote,
  //   undefined
  // );

  const createNewNote = async (formData) => {
    logInfo(APP_TYPE.GLANCE_NOTES, `Form Data Received: ${getPrettyfiedJSON(formData)}`);

    const updatedNotes = await createUserNote(issueKey, accountId, formData.newNoteField, storedNotes);

    setStoredNotes(updatedNotes);
    setModalOpen(false);
  }


  return (
    <Fragment>
      <Button text="New Note" onClick={() => setModalOpen(true)} />

      <Text>**Notes:**</Text>

      {storedNotes && storedNotes.map(note => {
        console.log('Note: ' + moment(note.created).format('MM/DD/YY HH:mm:ss'))
        return <Fragment>
          <Text>{note.note}</Text>
          <Text>{moment(note.create).format('MM/DD/YY HH:mm:ss')}</Text>
        </Fragment>
      })}
      {/* <Fragment><Text>{note.note}</Text><p>{moment(note.create).format('MM/DD/YY HH:mm:ss')}</p></Fragment>)} */}

      {isModalOpen && (
        <ModalDialog header="Create new Note" onClose={() => setModalOpen(false)}>
          <Form onSubmit={createNewNote} submitButtonText="Add Note">
            <TextArea isRequired={true} name="newNoteField" label="New Note" placeholder="Type your new note ... " />
          </Form>
        </ModalDialog>
      )}

    </Fragment>
  );
};

export const run = render(
  <IssueGlance>
    <App />
  </IssueGlance>
);
