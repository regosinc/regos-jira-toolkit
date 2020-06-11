import ForgeUI, { render, IssuePanel, useProductContext, Form, UserPicker } from '@forge/ui';

import { logInfo, getPrettyfiedJSON, APP_TYPE, logWarning } from './services/log.service';

const App = () => {
  // Context data
  const context = useProductContext();
  const issueKey = context.platformContext.issueKey;
  //const accountId = context.accountId;

  logInfo(APP_TYPE.PANEL_MEMBERS, `Issue Key: ${issueKey}`);

  const addUser = (formData) => {
    logInfo(APP_TYPE.PANEL_MEMBERS, `Data: ${ getPrettyfiedJSON(formData)}`);
  }

  return (    
    <Form onSubmit={addUser} submitButtonText='Add Member'>
      <UserPicker label="Search a user" name="newUser" />
    </Form>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);