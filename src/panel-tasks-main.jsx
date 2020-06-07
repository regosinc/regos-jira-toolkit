import ForgeUI, { render, IssuePanel, Fragment, Button, Form, TextArea, useProductContext, useState, ModalDialog, Text, Table, Head, Row, Cell, Avatar } from '@forge/ui';
import moment from 'moment';

import { logInfo, getPrettyfiedJSON, APP_TYPE, logWarning } from './services/log.service';
import { getTasks, addTask, updateTasks } from './services/tasks.service';

const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState({});
  const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState({});
  const [taskErrorValidation, setTaskErrorValidation] = useState(false);

  const taskMaxLength = 512;

  // Context data
  const context = useProductContext();
  const issueKey = context.platformContext.issueKey;
  const accountId = context.accountId;

  logInfo(APP_TYPE.PANEL_TASKS, `Issue Key: ${issueKey}`);

  // Read user stored data
  const [storedTasks, setStoredTasks] = useState(async () => await getTasks(issueKey));

  const addOrEditTask = async (formData) => {
    logInfo(APP_TYPE.PANEL_TASKS, `${(isEdit ? `Editing Task ${taskToEdit.id} ` : 'Creating new Task:')} ${getPrettyfiedJSON(formData)}`);

    if (!validateTask(formData.newTaskField)) {
      return;
    }

    setTaskErrorValidation(false);

    if (!isEdit) {
      const updatedTasks = await addTask(issueKey, accountId, formData.newTaskField, storedTasks);

      setStoredTasks(updatedTasks);
      setModalOpen(false);

      logInfo(APP_TYPE.PANEL_TASKS, `Task created successfully: ${getPrettyfiedJSON(formData)}`);
    } else {
      // Edit Task
      const values = [...storedTasks];
      const updatedTask = values.find(x => x.id === taskToEdit.id);
      updatedTask.description = formData.newTaskField;
      updatedTask.updated = new Date();
      updatedTask.updatedby = accountId;

      const result = await updateTasks(issueKey, values);

      if (result) {
        setStoredTasks(values);
        setTaskToEdit({});
        setModalOpen(false);
        logInfo(APP_TYPE.PANEL_TASKS, `Task edited successfully: ${getPrettyfiedJSON(formData)}`);
      } else {
        //TODO: Notify ?
        logInfo(APP_TYPE.PANEL_TASKS, `Task could not be edited: ${getPrettyfiedJSON(formData)}`);
      }
    }
  }

  const validateTask = (text) => {
    if (text.length > taskMaxLength) {
      logWarning(APP_TYPE.PANEL_TASKS, `Validation error when creating/editing a task, data exceed ${taskMaxLength} chars.`);
      setTaskErrorValidation(true);
      return false;
    }

    return true;
  }

  const deleteTask = async () => {
    logInfo(APP_TYPE.PANEL_TASKS, `Delete Task: ${taskToDelete.id}`);

    const tasksWithRemoved = storedTasks.filter(x => x.id !== taskToDelete.id);

    const result = await updateTasks(issueKey, tasksWithRemoved);

    if (result) {
      setStoredTasks(tasksWithRemoved);
      setTaskToDelete({});
      setModalDeleteOpen(false);
    }
    //else 
    // TODO: Show notification ?
  }

  const taskFinishedChanged = async (task) => {
    const values = [...storedTasks];
    const updatedTask = values.find(x => x.id === task.id);

    updatedTask.finished = !updatedTask.finished;
    updatedTask.updated = new Date();
    updatedTask.updatedby = accountId;

    const result = await updateTasks(issueKey, values);

    if (result) {
      setStoredTasks(values);
      logInfo(APP_TYPE.PANEL_TASKS, `Status Task changed successfully: ${getPrettyfiedJSON(updatedTask)}`);
    } else {
      //TODO: Notify ?
      logInfo(APP_TYPE.PANEL_TASKS, `Status Task could not be changed: ${getPrettyfiedJSON(updatedTask)}`);
    }
  }

  return (
    <Fragment>
      <Button text="Add Task" onClick={() => { setIsEdit(false); setModalOpen(true); }} />

      {/* No tasks */}
      {storedTasks && storedTasks.length == 0 && <Text>**Issue doesn't have any tasks yet**</Text>}

      {storedTasks && storedTasks.length > 0 &&
        <Table>
          <Head>
            <Cell>
              <Text content="Status" />
            </Cell>
            <Cell>
              <Text content="Description" />
            </Cell>
            <Cell>
              <Text content="Last update" />
            </Cell>
            <Cell>
              <Text content="Updated by" />
            </Cell>
            <Cell>
              <Text content="" />
            </Cell>
            <Cell>
              <Text content="" />
            </Cell>
          </Head>
          {storedTasks.map(task => (
            <Row>
              <Cell>
                <Button text={task.finished === true ? '☑️' : '☐'} onClick={() => taskFinishedChanged(task)}></Button>
              </Cell>
              <Cell>
                <Text content={task.description} />
              </Cell>
              <Cell>
                <Text content={moment(task.updated).format('MM/DD/YY HH:mm:ss')} />
              </Cell>
              <Cell>
                <Avatar accountId={task.updatedby} />
              </Cell>
              <Cell>
                <Button text="✎" onClick={() => { setIsEdit(true); setModalOpen(true); setTaskToEdit(task); }} />
              </Cell>
              <Cell>
                <Button text="⨯" onClick={() => { setModalDeleteOpen(true); setTaskToDelete(task); }} />
              </Cell>
            </Row>
          ))}
        </Table>
      }

      {/* Create new task / edit task */}
      {
        isModalOpen && (
          <ModalDialog header={isEdit ? "Edit Task" : "Add Task"} onClose={() => setModalOpen(false)}>
            <Form onSubmit={addOrEditTask} submitButtonText={isEdit ? "Edit" : "Add Task"}>
              <TextArea isRequired={true} name="newTaskField" label={isEdit ? "Edit Task" : "New Task"} placeholder="Type your new task ... " defaultValue={isEdit ? taskToEdit.description : ''} />
              {taskErrorValidation && <Text>Task description has to be less than {taskMaxLength} chars.</Text>}
            </Form>
          </ModalDialog>
        )
      }

      {/* Delete modal */}
      {
        isModalDeleteOpen && (
          <ModalDialog header="Delete Task" onClose={() => setModalDeleteOpen(false)}>
            <Form onSubmit={deleteTask} submitButtonText="Delete">
              <Text>**Are you sure you want to delete the task:** {taskToDelete.description} ?</Text>
            </Form>
          </ModalDialog>
        )
      }
    </Fragment >
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);