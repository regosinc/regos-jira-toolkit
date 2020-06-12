# Regos Jira Toolkit - Forge 

This project contains a Forge app written in Javascript to add several utilities to JIRA issues.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Development notes

If you have issues during the login on Forge, as for 06/06/20 we need to add this env vars in your development environment:

```
export FORGE_EMAIL=[rds]@gmail.com // RDS gmail account is the only one with access to Forge beta right now
export FORGE_API_TOKEN= //Generated Token from the atlassian user 
```

To set env vars 

forge variables:set FORGE_USER_VAR_ENV dev --environment

We need to set FORGE_USER_VAR_ when tunneling, otherwise the variable name.

Variables
ENV=devevelopment, staging or production

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app by editing the `src/index.jsx` file.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
